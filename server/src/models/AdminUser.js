import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const adminUserSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: 'Admin' },
    role: { type: String, default: 'admin' },
    // Password reset
    resetTokenHash: { type: String },
    resetTokenExpiry: { type: Date },
    // Email change
    pendingEmail: { type: String },
    emailVerifyTokenHash: { type: String },
    emailVerifyTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

adminUserSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

adminUserSchema.statics.hashToken = function (token) {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);
export { bcrypt };