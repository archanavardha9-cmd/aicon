import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Inbox, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { api } from "../api.js";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setError("");
    try {
      const r = await api.stats();
      setStats(r.data);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cards = stats
    ? [
        {
          label: "Total Enquiries",
          value: stats.total,
          icon: Inbox,
          accent: "#173b63",
        },
        { label: "New", value: stats.new, icon: Clock, accent: "#2463a6" },
        {
          label: "In Progress",
          value: stats.inProgress,
          icon: TrendingUp,
          accent: "#d97706",
        },
        {
          label: "Resolved",
          value: stats.resolved,
          icon: CheckCircle,
          accent: "#16a34a",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#173b63]">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of customer enquiries</p>
        </div>
        <button onClick={load} className="btn btn-secondary">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="card p-4 text-red-600">{error}</div>}

      {!stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-4 w-20 mb-3"></div>
              <div className="skeleton h-8 w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">
                  {c.label}
                </span>
                <c.icon size={20} style={{ color: c.accent }} />
              </div>
              <div className="text-3xl font-bold" style={{ color: c.accent }}>
                {c.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#173b63]">Recent Enquiries</h2>
          <button
            onClick={() => navigate("/enquiries")}
            className="text-sm text-[#173b63] font-medium hover:underline"
          >
            View all →
          </button>
        </div>
        {!stats ? (
          <div className="skeleton h-20"></div>
        ) : stats.recent?.length ? (
          <div className="divide-y divide-[#d4e4f5]">
            {stats.recent.map((e) => (
              <div
                key={e._id || e.id}
                onClick={() => navigate(`/enquiries/${e._id || e.id}`)}
                className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded"
              >
                <div>
                  <div className="font-medium text-[#173b63]">{e.name}</div>
                  <div className="text-sm text-gray-500">
                    {e.email} · {e.kind}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge badge-${e.status}`}>
                    {e.status?.replace("_", " ")}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No enquiries yet.
          </div>
        )}
      </div>

    </div>
  );
}
