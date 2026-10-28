import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { api } from "../api.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(email, password);
      onLogin(res.data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden md:flex md:w-1/2 bg-[#173b63] text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/aicon-logo.webp"
            alt="AICON"
            className="w-24 h-auto max-h-[96px] object-contain"
          />
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Manage Every Enquiry.
            <br />
            Deliver Better Experiences.
          </h2>
          <p className="text-blue-100 text-lg max-w-md">
            A centralized workspace to track, respond to, and resolve customer
            enquiries across all AICON products.
          </p>
        </div>
        <div className="text-xs text-blue-200">
          Internal workspace · AICON MODCON PVT LTD
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#f0f4f8]">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-[#173b63] mb-1">
            Welcome back
          </h1>
          <p className="text-gray-500 mb-6">
            Sign in to manage customer enquiries.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="input pl-9"
                  placeholder="admin@aicon.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="input pl-9 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-sm text-[#173b63] hover:underline"
              >
                Forgot password?
              </a>
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
