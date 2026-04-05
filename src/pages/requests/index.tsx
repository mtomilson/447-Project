import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Dropdown } from "../../components/Dropdown";

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

// Tanstack Query Functions

async function fetchLocations(): Promise<Location[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/location`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data.data;
}

async function fetchRequests(): Promise<Request[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/request`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data.data;
}

async function fetchMaterials(): Promise<MaterialItem[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/material`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data.data;
}

async function createRequest(body: {
  requested_to: string;
  requested_from: string;
}) {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/request/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export default function RequestsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [requestedFrom, setRequestedFrom] = useState("");
  const [requestedTo, setRequestedTo] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [formError, setFormError] = useState("");

  // tanstack query functions

  const {
    data: locations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });
  const { data: materials } = useQuery({
    queryKey: ["materials"],
    queryFn: fetchMaterials,
  });
  const { data: requests, isLoading: isRequestLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchRequests,
  });

  function closeModal() {
    setShowModal(false);
    setFormError("");
  }
  const addRequest = useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Successfully Created Request!");
      closeModal();
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });
  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    addRequest.mutate({
      requested_to: requestedTo,
      requested_from: requestedFrom,
    });
  }

  function getStatusColor(status: string | null) {
    switch (status) {
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "denied":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Material Requests</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-white font-semibold rounded-md hover:opacity-90 transition-opacity bg-secondary"
        >
          + New Request
        </button>
      </div>

      {/* Requests List */}
      {isRequestLoading ? (
        <p className="text-gray-500 text-center mt-10">Loading requests...</p>
      ) : requests?.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No requests found.</p>
      ) : (
        <div className="space-y-4">
          {requests?.map((req) => (
            <div
              key={req.request_id}
              className="bg-white rounded-lg shadow p-4 border-l-4 border-l-primary"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(req.created_at).toLocaleDateString()}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(req.status)}`}
                >
                  {req.status}
                </span>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                {req.request_item.map((item, i) => (
                  <p key={i}>
                    {item.material_item.item_name} — {item.quantity}{" "}
                    {item.material_item.unit || ""}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-8">
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">New Request</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From (Warehouse)
                  </label>
                  <Dropdown
                    options={locations?.map((loc) => ({ value: loc.location_id, label: loc.location_name ?? "" })) ?? []}
                    value={requestedFrom}
                    onChange={setRequestedFrom}
                    placeholder="Select warehouse"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To (Jobsite)
                  </label>
                  <Dropdown
                    options={locations?.map((loc) => ({ value: loc.location_id, label: loc.location_name ?? "" })) ?? []}
                    value={requestedTo}
                    onChange={setRequestedTo}
                    placeholder="Select jobsite"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material
                  </label>
                  <Dropdown
                    options={materials?.map((mat) => ({ value: mat.item_id, label: `${mat.item_name}${mat.unit ? ` (${mat.unit})` : ""}` })) ?? []}
                    value={itemId}
                    onChange={setItemId}
                    placeholder="Select material"
                    required
                  />
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
                  <p className="text-red-500 text-sm text-center">
                    {formError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={addRequest.isPending}
                  className="w-full py-3 bg-secondary text-white font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {addRequest.isPending ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </>
          </div>
        </div>
      )}
    </div>
  );
}
