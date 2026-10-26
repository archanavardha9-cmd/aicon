import { useState, useEffect } from "react";
import { Mail, Save, Key, Shield } from "lucide-react";
import { api } from "../api.js";

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [ceCurrent, setCeCurrent] = useState("");
  const [ceNew, setCeNew] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .me()
      .then((r) => setUser(r.data))
      .catch(() => {});
  }, []);

  const changePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setSaving(true);
    try {
      await api.changePassword(cpCurrent, cpNew, cpConfirm);
      setMsg("Password changed successfully.");
      setCpCurrent("");
      setCpNew("");
      setCpConfirm("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const changeEmail = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setSaving(true);
    try {
      await api.changeEmail(ceCurrent, ceNew);
      setMsg("Verification link sent to new email.");
      setCeCurrent("");
      setCeNew("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#173b63]">Account Settings</h1>
          <p className="text-gray-500 mt-1">Manage your admin account</p>
        </div>
      </div>

      {msg && (
        <div className="card p-4 flex items-start gap-3 text-green-700 bg-green-50 border-green-100">
          <div className="flex-shrink-0 mt-0.5">
            <Shield size={18} />
          </div>
          <div>
            <p className="text-sm font-medium">{msg}</p>
          </div>
        </div>
      )}
      {error && (
        <div className="card p-4 flex items-start gap-3 text-red-600 bg-red-50 border-red-100">
          <div className="flex-shrink-0 mt-0.5">
            <Mail size={18} />
          </div>
          <div>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {user && (
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#e8f0f8] flex items-center justify-center text-[#173b63] font-bold text-lg">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-[#173b63]">{user.email}</p>
              <p className="text-xs text-gray-500">
                {user.role || "Admin"} &bull; Account ID: {user.id}
              </p>
            </div>
          </div>
          <div className="border-t border-[#d4e4f5] pt-6">
            <p className="text-sm text-gray-500 mb-4">
              Update your login credentials below. Email changes require
              verification before taking effect.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="font-bold text-[#173b63] flex items-center gap-2 mb-6">
            <Key size={20} /> Change Password
          </h2>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={cpCurrent}
                onChange={(e) => setCpCurrent(e.target.value)}
                placeholder="Enter current password"
                required
                minLength={8}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={cpNew}
                onChange={(e) => setCpNew(e.target.value)}
                placeholder="New password (min 8 characters)"
                required
                minLength={8}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={cpConfirm}
                onChange={(e) => setCpConfirm(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={8}
                className="input w-full"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary w-full sm:w-auto"
            >
              <Save size={16} /> {saving ? "Saving..." : "Change Password"}
            </button>
          </form>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-[#173b63] flex items-center gap-2 mb-6">
            <Mail size={20} /> Change Email
          </h2>
          <form onSubmit={changeEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={ceCurrent}
                onChange={(e) => setCeCurrent(e.target.value)}
                placeholder="Enter current password"
                required
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Email Address
              </label>
              <input
                type="email"
                value={ceNew}
                onChange={(e) => setCeNew(e.target.value)}
                placeholder="you@example.com"
                required
                className="input w-full"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary w-full sm:w-auto"
            >
              <Save size={16} /> {saving ? "Sending..." : "Send Verification"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
