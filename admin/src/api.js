const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const TOKEN_KEY = 'aicon_admin_token';

let authToken = null;

function loadToken() {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) authToken = stored;
  } catch { /* localStorage unavailable; proceed without stored token */ }
}

function saveToken(token) {
  authToken = token;
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* localStorage unavailable; token kept in memory only */ }
}

function clearToken() {
  authToken = null;
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* localStorage unavailable; token already cleared in memory */ }
}

loadToken();

export function setAuthToken(token) { saveToken(token); }
export function clearAuthToken() { clearToken(); }
export function getAuthToken() { return authToken; }

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || 'Request failed');
  return data;
}

export const api = {
  login: async (email, password) => {
    const res = await request('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (res?.data?.token) setAuthToken(res.data.token);
    return res;
  },
  forgotPassword: (email) => request('/admin/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) => request('/admin/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  changePassword: (currentPassword, newPassword, confirmPassword) => request('/admin/account/password', { method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword, confirmPassword }) }),
  changeEmail: (currentPassword, newEmail) => request('/admin/account/email', { method: 'PATCH', body: JSON.stringify({ currentPassword, newEmail }) }),
  verifyEmail: (token) => request('/admin/account/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),
  logout: async () => {
    clearAuthToken();
    return request('/admin/auth/logout', { method: 'POST' }).catch(() => {});
  },
  me: () => request('/admin/auth/me'),
  stats: () => request('/admin/dashboard/stats'),
  enquiries: (params) => request('/admin/enquiries?' + new URLSearchParams(params)),
  enquiry: (id) => request(`/admin/enquiries/${id}`),
  updateStatus: (id, status, notes) => request(`/admin/enquiries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
};