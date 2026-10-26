import { NavLink } from "react-router-dom";
import { LayoutDashboard, Inbox, LogOut, Settings } from "lucide-react";

export default function Sidebar({ user, onLogout, mobileOpen, onClose }) {
  const items = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/enquiries", label: "Enquiries", icon: Inbox },
    { to: "/account", label: "Account Settings", icon: Settings },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#d4e4f5] transform transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} md:h-screen md:sticky md:top-0 md:overflow-y-auto`}
      >
        <div className="p-6 border-b border-[#d4e4f5]">
          <div className="flex items-center gap-3">
            <img src="/aicon-logo.png" alt="AICON" className="w-10 h-10 object-contain" />
            <div>
              <div className="font-bold text-[#173b63]">AICON</div>
              <div className="text-xs text-gray-500">Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-[#e8f0f8] text-[#173b63]" : "text-gray-600 hover:bg-gray-50"}`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-[#d4e4f5] mt-auto">
          <div className="text-xs text-gray-500 mb-2 truncate">
            {user?.email}
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#173b63]"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
