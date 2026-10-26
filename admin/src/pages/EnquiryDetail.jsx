import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Tag,
  MessageSquare,
  Save,
} from "lucide-react";
import { api } from "../api.js";

export default function EnquiryDetail() {
  const { id } = useParams();
  const [enquiry, setEnquiry] = useState(null);
  const [status, setStatus] = useState("new");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .enquiry(id)
      .then((r) => {
        setEnquiry(r.data);
        setStatus(r.data.status || "new");
        setNotes(r.data.notes || "");
      })
      .catch(() => setMsg("Failed to load"));
  }, [id]);

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      await api.updateStatus(id, status, notes);
      setMsg("Status updated successfully");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!enquiry)
    return (
      <div className="min-h-screen flex items-center justify-center text-[#173b63]">
        Loading...
      </div>
    );

  return (
    <div className="space-y-6 max-w-4xl">
      <button
        onClick={() => navigate("/enquiries")}
        className="flex items-center gap-2 text-[#173b63] font-medium hover:underline"
      >
        <ArrowLeft size={16} /> Back to Enquiries
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#173b63]">Enquiry Details</h1>
          <p className="text-gray-500 mt-1">
            Reference: {enquiry._id || enquiry.id}
          </p>
        </div>
        <span className={`badge badge-${enquiry.status}`}>
          {enquiry.status?.replace("_", " ")}
        </span>
      </div>

      {msg && (
        <div className="card p-3 text-sm text-green-700 bg-green-50 border-green-200">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-[#173b63] flex items-center gap-2">
            <Tag size={18} /> Customer Information
          </h2>
          <div>
            <span className="text-gray-500 text-sm">Name</span>
            <div className="font-medium">{enquiry.name}</div>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Email</span>
            <div>
              <a
                href={`mailto:${enquiry.email}`}
                className="text-[#173b63] underline"
              >
                {enquiry.email}
              </a>
            </div>
          </div>
          {enquiry.phone && (
            <div>
              <span className="text-gray-500 text-sm">Phone</span>
              <div>
                <a
                  href={`tel:${enquiry.phone}`}
                  className="text-[#173b63] underline"
                >
                  {enquiry.phone}
                </a>
              </div>
            </div>
          )}
          {enquiry.categoryId && (
            <div>
              <span className="text-gray-500 text-sm">Category</span>
              <div>{enquiry.categoryId}</div>
            </div>
          )}
          {enquiry.productId && (
            <div>
              <span className="text-gray-500 text-sm">Product</span>
              <div>{enquiry.productId}</div>
            </div>
          )}
          <div>
            <span className="text-gray-500 text-sm">Submitted</span>
            <div className="flex items-center gap-1">
              <Calendar size={14} />{" "}
              {new Date(enquiry.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-[#173b63] flex items-center gap-2">
            <MessageSquare size={18} /> Message
          </h2>
          <p className="whitespace-pre-wrap text-gray-700">{enquiry.message}</p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-[#173b63]">Status & Notes</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input w-auto"
          >
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-500 block mb-1">
            Internal Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input"
            rows={4}
          />
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
