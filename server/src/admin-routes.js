import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { AdminUser, bcrypt } from './models/AdminUser.js';
import { Enquiry } from './models/Enquiry.js';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me';
const ADMIN_FRONTEND_URL = process.env.ADMIN_FRONTEND_URL || 'http://localhost:5174';
const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000;
const VERIFY_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  try {
    const [header, body, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  req.admin = payload;
  next();
}

const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });
const statusSchema = z.object({ status: z.enum(['new', 'in_progress', 'resolved']), notes: z.string().max(2000).optional() });
const resetRequestSchema = z.object({ email: z.string().trim().email() });
const resetPasswordSchema = z.object({ token: z.string().min(1), password: z.string().min(8).max(128) });
const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8).max(128), confirmPassword: z.string() });
const changeEmailSchema = z.object({ currentPassword: z.string().min(1), newEmail: z.string().trim().email() });

export function createAdminRouter({ emailTransporter, fromEmail } = {}) {
  const router = Router();

  // --- Auth ---
  router.post('/auth/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid credentials.' } });
    const { email, password } = parsed.data;
    const user = await AdminUser.findOne({ email });
    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
    }
    const token = signToken({ sub: user._id, email: user.email, role: user.role });
    return res.json({ data: { token, user: { id: user._id, email: user.email, name: user.name, role: user.role } } });
  });

  router.post('/auth/logout', (_req, res) => res.json({ data: { ok: true } }));

  router.get('/auth/me', authMiddleware, async (req, res) => {
    const user = await AdminUser.findById(req.admin.sub).select('-passwordHash -resetTokenHash -emailVerifyTokenHash');
    if (!user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found.' } });
    return res.json({ data: { id: user._id, email: user.email, name: user.name, role: user.role, pendingEmail: user.pendingEmail } });
  });

  // --- Forgot Password ---
  router.post('/auth/forgot-password', async (req, res) => {
    const parsed = resetRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid email.' } });
    const { email } = parsed.data;
    const user = await AdminUser.findOne({ email });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hash = AdminUser.hashToken(rawToken);
      await AdminUser.updateOne({ _id: user._id }, { resetTokenHash: hash, resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS) });
      if (emailTransporter) {
        const link = `${ADMIN_FRONTEND_URL}/reset-password?token=${rawToken}`;
        try {
          await emailTransporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL,
            to: email,
            subject: 'AICON Admin Password Reset',
            text: `Reset your password: ${link}\nThis link expires in 15 minutes.`,
            html: `<p>Reset your password: <a href="${link}">${link}</a></p><p>This link expires in 15 minutes.</p>`,
          });
        } catch (err) {
          console.error('Password reset email failed');
        }
      }
    }
    // Generic response regardless
    return res.json({ data: { message: 'If the email exists, a reset link has been sent.' } });
  });

  // --- Reset Password ---
  router.post('/auth/reset-password', async (req, res) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request.' } });
    const { token, password } = parsed.data;
    const hash = AdminUser.hashToken(token);
    const user = await AdminUser.findOne({ resetTokenHash: hash, resetTokenExpiry: { $gt: new Date() } });
    if (!user) return res.status(400).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired reset token.' } });
    const passwordHash = await bcrypt.hash(password, 12);
    await AdminUser.updateOne({ _id: user._id }, { passwordHash, resetTokenHash: null, resetTokenExpiry: null });
    return res.json({ data: { message: 'Password reset successfully.' } });
  });

  // --- Account: Change Password ---
  router.patch('/account/password', authMiddleware, async (req, res) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request.' } });
    const { currentPassword, newPassword, confirmPassword } = parsed.data;
    if (newPassword !== confirmPassword) return res.status(400).json({ error: { code: 'MISMATCH', message: 'Passwords do not match.' } });
    const user = await AdminUser.findById(req.admin.sub);
    if (!user || !(await user.verifyPassword(currentPassword))) {
      return res.status(401).json({ error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect.' } });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await AdminUser.updateOne({ _id: user._id }, { passwordHash, resetTokenHash: null, resetTokenExpiry: null });
    return res.json({ data: { message: 'Password changed successfully.' } });
  });

  // --- Account: Change Email (request) ---
  router.patch('/account/email', authMiddleware, async (req, res) => {
    const parsed = changeEmailSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request.' } });
    const { currentPassword, newEmail } = parsed.data;
    const user = await AdminUser.findById(req.admin.sub);
    if (!user || !(await user.verifyPassword(currentPassword))) {
      return res.status(401).json({ error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect.' } });
    }
    const existing = await AdminUser.findOne({ email: newEmail });
    if (existing && existing._id !== user._id) {
      return res.status(409).json({ error: { code: 'EMAIL_EXISTS', message: 'Email already in use.' } });
    }
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hash = AdminUser.hashToken(rawToken);
    await AdminUser.updateOne({ _id: user._id }, { pendingEmail: newEmail, emailVerifyTokenHash: hash, emailVerifyTokenExpiry: new Date(Date.now() + VERIFY_TOKEN_EXPIRY_MS) });
    if (emailTransporter) {
      const link = `${ADMIN_FRONTEND_URL}/verify-email?token=${rawToken}`;
      try {
        await emailTransporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL,
          to: newEmail,
          subject: 'AICON Admin Email Verification',
          text: `Verify your new email: ${link}\nThis link expires in 1 hour.`,
          html: `<p>Verify your new email: <a href="${link}">${link}</a></p><p>This link expires in 1 hour.</p>`,
        });
      } catch (err) {
        console.error('Email verification send failed');
      }
    }
    return res.json({ data: { message: 'Verification link sent to new email.' } });
  });

  // --- Verify Email Change ---
  router.post('/account/verify-email', async (req, res) => {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Token required.' } });
    const hash = AdminUser.hashToken(token);
    const user = await AdminUser.findOne({ emailVerifyTokenHash: hash, emailVerifyTokenExpiry: { $gt: new Date() } });
    if (!user || !user.pendingEmail) return res.status(400).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token.' } });
    await AdminUser.updateOne({ _id: user._id }, { email: user.pendingEmail, pendingEmail: null, emailVerifyTokenHash: null, emailVerifyTokenExpiry: null });
    return res.json({ data: { message: 'Email updated successfully.' } });
  });

  // --- Dashboard & Enquiries ---
  router.get('/dashboard/stats', authMiddleware, async (_req, res) => {
    const [total, byStatus, byKind, recent] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Enquiry.aggregate([{ $group: { _id: '$kind', count: { $sum: 1 } } }]),
      Enquiry.find().sort({ createdAt: -1 }).limit(5).select('_id name email kind status createdAt').lean(),
    ]);
    const statusMap = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
    const kindMap = Object.fromEntries(byKind.map((k) => [k._id, k.count]));
    return res.json({ data: { total, new: statusMap.new || 0, inProgress: statusMap.in_progress || 0, resolved: statusMap.resolved || 0, byKind: { product: kindMap.product || 0, contact: kindMap.contact || 0 }, recent } });
  });

  router.get('/enquiries', authMiddleware, async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.q) {
      const re = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: re }, { email: re }, { phone: re }, { _id: re }];
    }
    const [items, total] = await Promise.all([
      Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Enquiry.countDocuments(filter),
    ]);
    return res.json({ data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  });

  router.get('/enquiries/:id', authMiddleware, async (req, res) => {
    const enquiry = await Enquiry.findById(req.params.id).lean();
    if (!enquiry) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Enquiry not found.' } });
    return res.json({ data: enquiry });
  });

  router.patch('/enquiries/:id/status', authMiddleware, async (req, res) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid status.' } });
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status: parsed.data.status, notes: parsed.data.notes }, { new: true });
    if (!enquiry) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Enquiry not found.' } });
    return res.json({ data: enquiry });
  });

  return router;
}