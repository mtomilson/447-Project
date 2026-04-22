import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import type { Location, PayOrder } from "../../../types/requests";
import toast from "react-hot-toast";

async function fetchLocations(): Promise<Location[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/location`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data;
}

async function fetchOrders(): Promise<PayOrder[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data;
}

async function updateStatus(po_id: string, newStatus: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${po_id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newStatus }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export function WarehouseDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  const updateOrder = useMutation({
    mutationFn: ({ po_id, newStatus }: { po_id: string; newStatus: string }) =>
      updateStatus(po_id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Marked as shipped!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const ordersToShip = orders?.filter(
    (o) => o.status === "created" && o.source_location_id
  ) ?? [];

  const totalItems = locations?.reduce((acc: number, loc: any) => {
    return acc + (loc.location_item?.reduce(
      (sum: number, item: any) => sum + (item.quantity ?? 0), 0
    ) ?? 0);
  }, 0) ?? 0;

  const lowStockCount = locations?.reduce((acc: number, loc: any) => {
    return acc + (loc.location_item?.filter((item: any) => item.quantity !== null && item.quantity < 5).length ?? 0);
  }, 0) ?? 0;

  const shippedToday = orders?.filter((o) => o.status === "shipped").length ?? 0;

  function getLocationName(id: string | null) {
    if (!id) return "-";
    return locations?.find((loc) => loc.location_id === id)?.location_name ?? "-";
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#013868" }}>Home</h1>
        <p className="text-sm text-gray-500">Main Warehouse · {user?.[0]?.name ?? "Warehouse"}</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="col-span-1 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-3xl font-bold" style={{ color: "#013868" }}>{totalItems}</p>
              <p className="text-sm text-gray-500 mt-1">Items in stock</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-3xl font-bold text-orange-500">{ordersToShip.length}</p>
              <p className="text-sm text-gray-500 mt-1">Orders to ship</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-3xl font-bold text-red-500">{lowStockCount}</p>
              <p className="text-sm text-gray-500 mt-1">Low stock flags</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-3xl font-bold" style={{ color: "#7AC142" }}>{shippedToday}</p>
              <p className="text-sm text-gray-500 mt-1">Shipped today</p>
            </div>
          </div>

          {/* Log New Delivery */}
          <button className="w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors" style={{ borderColor: "#7AC142" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="#7AC142" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold text-sm" style={{ color: "#7AC142" }}>Log new delivery</span>
            <span className="text-xs text-gray-400">Photograph packing slip to begin</span>
          </button>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-2 space-y-6">
          {/* Orders to Ship */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold" style={{ color: "#013868" }}>Orders to ship</h2>
              <a href="/orders" className="text-sm font-medium hover:opacity-80" style={{ color: "#7AC142" }}>View all</a>
            </div>
            {ordersToShip.length === 0 ? (
              <p className="text-gray-400 text-sm">No orders to ship.</p>
            ) : (
              <div className="space-y-3">
                {ordersToShip.slice(0, 5).map((order) => (
                  <div key={order.po_id} className="bg-white rounded-lg shadow p-4 border-l-4" style={{ borderLeftColor: "#013868" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold" style={{ color: "#013868" }}>{order.po_number}</span>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">Created</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                    From: {getLocationName(order.source_location_id)}  to {getLocationName(order.destination_location_id)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.pay_order_item.map((item, i) => (
                        <span key={i}>{item.material_item.item_name} — {item.quantity} {item.material_item.unit || ""}{i < order.pay_order_item.length - 1 ? " · " : ""}</span>
                      ))}
                    </p>
                    <button
                      onClick={() => updateOrder.mutate({ po_id: order.po_id, newStatus: "shipped" })}
                      disabled={updateOrder.isPending}
                      className="mt-3 px-3 py-1 text-xs font-semibold text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: "#7AC142" }}
                    >
                      Mark as Shipped
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Deliveries - placeholder */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold" style={{ color: "#013868" }}>Recent deliveries</h2>
              <a href="/deliveries" className="text-sm font-medium hover:opacity-80" style={{ color: "#7AC142" }}>View all</a>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-sm text-gray-400">
              No deliveries logged yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}