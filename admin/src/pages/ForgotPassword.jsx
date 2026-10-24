import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { api } from "../api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setMsg("If the email exists, a reset link has been sent.");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-[#173b63] mb-1">
          Forgot Password
        </h1>
        <p className="text-gray-500 mb-6">
          Enter your admin email to receive a reset link.
        </p>
        <form onSubmit={submit} className="space-y-4">
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
                className="input pl-9"
              />
            </div>
          </div>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}
          {msg && (
            <div className="text-green-700 text-sm bg-green-50 p-3 rounded">
              {msg}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-[#173b63] hover:underline"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
