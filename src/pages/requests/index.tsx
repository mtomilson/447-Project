import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

type RequestItem = {
  item_id: string;
  quantity: number | null;
  material_item: {
    item_name: string;
    unit: string | null;
  };
};

type Request = {
  request_id: string;
  status: string | null;
  created_at: string;
  logged_by: string | null;
  requested_from: string | null;
  requested_to: string | null;
  request_item: RequestItem[];
};

type Location = {
  location_id: string;
  location_name: string | null;
};

type MaterialItem = {
  item_id: string;
  item_name: string;
  unit: string | null;
};

export default function RequestsPage() {
  const { user, token } = useAuth();

  const [requests, setRequests] = useState<Request[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [requestedFrom, setRequestedFrom] = useState("");
  const [requestedTo, setRequestedTo] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  async function fetchRequests() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setRequests(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    async function fetchData() {
      const [locRes, matRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/locations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/materials`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const locData = await locRes.json();
      const matData = await matRes.json();
      setLocations(locData.data || []);
      setMaterials(matData.data || []);
    }
    fetchRequests();
    fetchData();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          logged_by: user.user_id,
          requested_from: requestedFrom,
          requested_to: requestedTo,
          status: "requested",
          item_id: itemId,
          quantity: quantity,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create request");
      }
      setFormSuccess(true);
      setRequestedFrom("");
      setRequestedTo("");
      setItemId("");
      setQuantity(1);
      fetchRequests();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setFormSuccess(false);
    setFormError("");
  }

  function getStatusColor(status: string | null) {
    switch (status) {
      case "requested": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "denied": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#013868" }}>
          Material Requests
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-white font-semibold rounded-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#7AC142" }}
        >
          + New Request
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <p className="text-gray-500 text-center mt-10">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No requests found.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.request_id} className="bg-white rounded-lg shadow p-4 border-l-4" style={{ borderLeftColor: "#013868" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(req.created_at).toLocaleDateString()}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(req.status)}`}>
                  {req.status}
                </span>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                {req.request_item.map((item, i) => (
                  <p key={i}>
                    {item.material_item.item_name} — {item.quantity} {item.material_item.unit || ""}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-8">
            {formSuccess ? (
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2" style={{ color: "#013868" }}>
                  Request Submitted!
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Your request has been sent for approval.
                </p>
                <button
                  onClick={closeModal}
                  className="w-full py-3 text-white font-semibold rounded-md hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#7AC142" }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold" style={{ color: "#013868" }}>
                    New Request
                  </h2>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From (Warehouse)
                    </label>
                    <select
                      value={requestedFrom}
                      onChange={(e) => setRequestedFrom(e.target.value)}
                      required
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-700"
                      style={{ outlineColor: "#013868" }}
                    >
                      <option value="">Select warehouse</option>
                      {locations.map((loc) => (
                        <option key={loc.location_id} value={loc.location_id}>
                          {loc.location_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To (Jobsite)
                    </label>
                    <select
                      value={requestedTo}
                      onChange={(e) => setRequestedTo(e.target.value)}
                      required
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-700"
                    >
                      <option value="">Select jobsite</option>
                      {locations.map((loc) => (
                        <option key={loc.location_id} value={loc.location_id}>
                          {loc.location_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material
                    </label>
                    <select
                      value={itemId}
                      onChange={(e) => setItemId(e.target.value)}
                      required
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-700"
                    >
                      <option value="">Select material</option>
                      {materials.map((mat) => (
                        <option key={mat.item_id} value={mat.item_id}>
                          {mat.item_name} {mat.unit ? `(${mat.unit})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      required
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    />
                  </div>
                  {formError && (
                    <p className="text-red-500 text-sm text-center">{formError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-3 text-white font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: "#7AC142" }}
                  >
                    {formLoading ? "Submitting..." : "Submit Request"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}