import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Save, Key } from "lucide-react";
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
  const navigate = useNavigate();

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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-[#173b63]">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your admin account</p>
      </div>
      {user && (
        <div className="card p-4">
          <span className="text-gray-500 text-sm">Current email:</span>{" "}
          <span className="font-medium">{user.email}</span>
        </div>
      )}
      {msg && <div className="card p-3 text-green-700 bg-green-50">{msg}</div>}
      {error && <div className="card p-3 text-red-600 bg-red-50">{error}</div>}

      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-[#173b63] flex items-center gap-2">
          <Key size={18} /> Change Password
        </h2>
        <form onSubmit={changePassword} className="space-y-3">
          <input
            type="password"
            value={cpCurrent}
            onChange={(e) => setCpCurrent(e.target.value)}
            placeholder="Current password"
            required
            className="input"
          />
          <input
            type="password"
            value={cpNew}
            onChange={(e) => setCpNew(e.target.value)}
            placeholder="New password (min 8)"
            required
            minLength={8}
            className="input"
          />
          <input
            type="password"
            value={cpConfirm}
            onChange={(e) => setCpConfirm(e.target.value)}
            placeholder="Confirm new password"
            required
            minLength={8}
            className="input"
          />
          <button type="submit" disabled={saving} className="btn btn-primary">
            <Save size={16} /> {saving ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-[#173b63] flex items-center gap-2">
          <Mail size={18} /> Change Email
        </h2>
        <form onSubmit={changeEmail} className="space-y-3">
          <input
            type="password"
            value={ceCurrent}
            onChange={(e) => setCeCurrent(e.target.value)}
            placeholder="Current password"
            required
            className="input"
          />
          <input
            type="email"
            value={ceNew}
            onChange={(e) => setCeNew(e.target.value)}
            placeholder="New email"
            required
            className="input"
          />
          <button type="submit" disabled={saving} className="btn btn-primary">
            <Save size={16} /> {saving ? "Sending..." : "Send Verification"}
          </button>
        </form>
      </div>
    </div>
  );
}
