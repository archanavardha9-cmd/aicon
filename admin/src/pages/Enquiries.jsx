import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw, Filter, Inbox } from "lucide-react";
import { api } from "../api.js";

export default function Enquiries() {
  const [data, setData] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = async (opts = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.enquiries({
        q: opts.q ?? q,
        status: opts.status ?? status,
        page: opts.page ?? page,
        limit: 20,
      });
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, q, status]);

  const clearFilters = () => {
    setQ("");
    setStatus("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, phone..."
              className="input pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input w-auto"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <button
            onClick={() => {
              setPage(1);
              load();
            }}
            className="btn btn-primary"
          >
            Search
          </button>
          <button onClick={clearFilters} className="btn btn-ghost">
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="card p-4 text-red-600 flex items-center justify-between">
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
                    <td className="p-4 font-medium text-[#173b63]">{e.name}</td>
                    <td className="p-4 text-gray-600">{e.email}</td>
                    <td className="p-4">
                      <span className={`badge badge-${e.status}`}>
                        {e.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => navigate(`/enquiries/${e._id || e.id}`)}
                        className="text-[#173b63] font-medium hover:underline"
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
        <div className="flex items-center justify-center gap-2">
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
