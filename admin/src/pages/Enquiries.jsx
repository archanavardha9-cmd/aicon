import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw, Inbox } from "lucide-react";
import { api } from "../api.js";

export default function Enquiries() {
  const [data, setData] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    api
      .enquiries({ q, status, page, limit: 20 })
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError("");
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, q, status, refreshIndex]);

  const load = () => {
    setLoading(true);
    setRefreshIndex((prev) => prev + 1);
  };

  const clearFilters = () => {
    setQ("");
    setStatus("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#173b63]">
            Customer Enquiries
          </h1>
          <p className="text-gray-500 mt-1">
            {data.meta?.total ?? 0} total results
          </p>
        </div>
        <button onClick={load} className="btn btn-secondary">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="relative w-full md:w-auto min-w-[200px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, phone..."
              className="input pl-9 w-full"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input w-full md:w-auto"
            >
              <option value="">All statuses</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-end md:items-center">
              <button
                onClick={() => {
                  setPage(1);
                  load();
                }}
                className="btn btn-primary w-full md:w-auto"
              >
                Search
              </button>
              <button onClick={clearFilters} className="btn btn-ghost w-full md:w-auto">
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="card p-4 text-red-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {error}
          <button onClick={load} className="btn btn-secondary">
            Retry
          </button>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-10"></div>
            ))}
          </div>
        ) : data.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-[#d4e4f5]">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-600">
                    Customer
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((e) => (
                  <tr
                    key={e._id || e.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-medium text-[#173b63] truncate">{e.name}</td>
                    <td className="p-4 text-gray-600 truncate">{e.email}</td>
                    <td className="p-4">
                      <span className={`badge badge-${e.status}`}>
                        {e.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm truncate">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => navigate(`/enquiries/${e._id || e.id}`)}
                        className="text-[#173b63] font-medium hover:underline whitespace-nowrap"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Inbox size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No enquiries found.</p>
          </div>
        )}
      </div>

      {data.meta?.pages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="btn btn-secondary disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 text-sm text-gray-600">
            Page {data.meta?.page || page} of {data.meta?.pages || 1}
          </span>
          <button
            disabled={page >= (data.meta?.pages || 1)}
            onClick={() => setPage(page + 1)}
            className="btn btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
