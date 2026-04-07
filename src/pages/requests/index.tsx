import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AddRequestModal from "../../components/modals/AddRequestModal";
import { useAuth } from "../../context/AuthContext";
import { Dropdown } from "../../components/Dropdown";

import type { Location, Request, Status } from "../../types/requests";
import toast from "react-hot-toast";

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

async function updateStatus(requestId: string, newStatus: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/request/${requestId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newStatus }),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

export default function RequestsPage() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // tanstack query functions
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const role = user?.[0]?.role;

  const updateRequest = useMutation({
    mutationFn: ({
      requestId,
      newStatus,
    }: {
      requestId: string;
      newStatus: string;
    }) => updateStatus(requestId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({queryKey: ["locations"]})
      toast.success("Updated Status");
    },
    onError: () => {
      toast.error("ERROR");
    },
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  const { data: requests, isLoading: isRequestLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchRequests,
  });

  function closeModal() {
    setShowModal(false);
  }

  function getLocationName(id: string | null) {
    if (!id) return "-";
    return (
      locations?.find((loc) => loc.location_id === id)?.location_name ?? "-"
    );
  }

  function getStatusColor(status: string | null) {
    switch (status) {
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "denied":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function getStatusActions(role: string, status: string | null) {
    if (role === "jobsite_logistic" && status === "shipped") {
      return [{ label: "Mark as Delivered", newStatus: "delivered" }];
    } else if (role === "warehouse_logistic" && status === "approved") {
      return [{ label: "Mark as Shipped", newStatus: "shipped" }];
    } else if (role === "project_manager" && status === "requested") {
      return [
        { label: "Approve", newStatus: "approved" },
        { label: "Deny", newStatus: "denied" },
      ];
    } else {
      return [];
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary">Requests</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-white font-semibold rounded-md hover:opacity-90 transition-opacity bg-secondary"
        >
          + New Request
        </button>
      </div>
      <div className="mb-6">
        <Dropdown
          options={[
            { value: "all", label: "All" },
            { value: "requested", label: "Requested" },
            { value: "approved", label: "Approved" },
            { value: "shipped", label: "Shipped" },
            { value: "delivered", label: "Delivered" },
            { value: "denied", label: "Denied" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by status"
        />
      </div>

      {/* Requests List */}
      {isRequestLoading ? (
        <p className="text-gray-500 text-center mt-10">Loading requests...</p>
      ) : requests?.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No requests found.</p>
      ) : (
        <div className="space-y-4">
          {requests
            ?.filter(
              (req) => statusFilter === "all" || req.status === statusFilter,
            )
            ?.map((req) => (
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

                <div className="text-sm text-gray-500 mb-2">
                  <span className="capitalize">
                    From: {getLocationName(req.requested_from)}
                  </span>
                  <span className="mx-2">→</span>
                  <span className="capitalize">
                    To: {getLocationName(req.requested_to)}
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
                <div className="flex gap-2 mt-3">
                  {getStatusActions(role, req.status).map((action) => (
                    <button
                      key={action.newStatus}
                      onClick={() => {
                        updateRequest.mutate({
                          requestId: req.request_id,
                          newStatus: action.newStatus,
                        });
                      }}
                      className={`px-3 py-1 text-xs font-semibold text-white rounded-md hover:opacity-90 transition-opacity ${action.newStatus === "denied" ? "bg-red-500" : "bg-secondary"}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {showModal && (
        <AddRequestModal onClose={closeModal} locations={locations ?? []} />
      )}
    </div>
  );
}
