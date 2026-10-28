import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { ExternalLink } from "lucide-react";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Enquiries from "./pages/Enquiries.jsx";
import EnquiryDetail from "./pages/EnquiryDetail.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import AccountSettings from "./pages/AccountSettings.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { api } from "./api.js";

const WEBSITE_URL =
  import.meta.env.VITE_PUBLIC_WEBSITE_URL || "http://localhost:5173";

function Layout({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const titleMap = {
    "/": "Dashboard",
    "/enquiries": "Enquiries",
    "/account": "Account Settings",
  };
  const title = titleMap[location.pathname] || "Admin";
  return (
    <div className="flex min-h-screen md:h-screen md:overflow-hidden">
      <Sidebar
        user={user}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-h-screen md:h-screen md:overflow-hidden">
        <header className="bg-white border-b border-[#d4e4f5] px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 flex-wrap gap-4 sm:gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-[#173b63] p-2 text-xl leading-none"
            >
              ☰
            </button>
            <img
              src="/aicon-logo.webp"
              alt="AICON"
              className="w-20 h-auto max-h-[72px] object-contain hidden md:block"
            />
            <div>
              <div className="font-bold text-[#173b63] text-sm">Admin</div>
              <div className="text-xs text-gray-500">{title}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-[#173b63] bg-[#e8f0f8] border border-[#d4e4f5] hover:bg-[#dbeafe] hover:text-[#173b63] transition-colors focus:outline-none focus:ring-2 focus:ring-[#173b63]/20"
            >
              <ExternalLink size={16} />
              <span title="Open AICON website" className="font-medium">View Website</span>
            </a>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore logout failure
    }
    setUser(null);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-[#173b63]">
        Loading...
      </div>
    );

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login onLogin={setUser} />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            element={
              user ? (
                <Layout user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/enquiries/:id" element={<EnquiryDetail />} />
            <Route path="/account" element={<AccountSettings />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
