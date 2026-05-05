import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { StatCard } from "../../../components/StatCard";
import { Link } from "react-router-dom";
import { fetchLocations } from "../../../lib/tanstack/locations";
import { fetchOrders } from "../../../lib/tanstack/orders";
import { updateStatus } from "../../../lib/tanstack/orders";

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

  const ordersToShip =
    orders?.filter((o) => o.status === "created" && o.source_location_id) ?? [];

  const totalItems =
    locations?.reduce((acc: number, loc: any) => {
      return (
        acc +
        (loc.location_item?.reduce(
          (sum: number, item: any) => sum + (item.quantity ?? 0),
          0,
        ) ?? 0)
      );
    }, 0) ?? 0;

  const lowStockCount =
    locations?.reduce((acc: number, loc: any) => {
      return (
        acc +
        (loc.location_item?.filter(
          (item: any) => item.quantity !== null && item.quantity < 5,
        ).length ?? 0)
      );
    }, 0) ?? 0;

  const today = new Date().toDateString();
  const shippedToday =
    orders?.filter(
      (o) => o.shipped_at && new Date(o.shipped_at).toDateString() === today,
    ).length ?? 0;

  function getLocationName(id: string | null) {
    if (!id) return "-";
    return (
      locations?.find((loc) => loc.location_id === id)?.location_name ?? "-"
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-primary mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">
        Warehouse Logistics · {user?.[0]?.name ?? "Warehouse"}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Items in Stock"
          value={totalItems}
          color="text-primary"
        />
        <StatCard
          label="Orders to Ship"
          value={ordersToShip.length}
          color="text-orange-500"
        />
        <StatCard
          label="Low Stock Flags"
          value={lowStockCount}
          color="text-red-500"
        />
        <StatCard
          label="Shipped Today"
          value={shippedToday}
          color="text-secondary"
        />
      </div>

      <div className="flex flex-col gap-6">
        {/* Orders to Ship */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-primary">Orders to Ship</h2>
            <Link
              to="/orders"
              className="text-sm text-secondary hover:underline"
            >
              View all
            </Link>
          </div>
          {ordersToShip.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders to ship.</p>
          ) : (
            <div className="space-y-3">
              {ordersToShip.slice(0, 5).map((order) => (
                <div
                  key={order.po_id}
                  className="bg-white rounded-lg shadow p-4 border-l-4 border-l-primary"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-primary">
                      {order.po_number}
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      Created
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    From: {getLocationName(order.source_location_id)} → To:{" "}
                    {getLocationName(order.destination_location_id)}
                  </p>
                  <div className="text-sm text-gray-700 space-y-1">
                    {order.pay_order_item.map((item, i) => (
                      <p key={i}>
                        {item.material_item.item_name} — {item.quantity}{" "}
                        {item.material_item.unit || ""}
                      </p>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      updateOrder.mutate({
                        po_id: order.po_id,
                        newStatus: "shipped",
                      })
                    }
                    disabled={updateOrder.isPending}
                    className="mt-3 px-3 py-1 text-xs font-semibold text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 bg-secondary"
                  >
                    Mark as Shipped
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warehouse Inventory */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-primary">
              Warehouse Inventory
            </h2>
            <Link
              to="/inventory"
              className="text-sm text-secondary hover:underline"
            >
              View all
            </Link>
          </div>
          {(() => {
            const warehouse = locations?.find(
              (l) => l.location_name === "Main Warehouse",
            );
            if (!warehouse)
              return (
                <p className="text-gray-400 text-sm">Warehouse not found.</p>
              );
            return (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left table-fixed">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3 w-1/2">Material</th>
                      <th className="px-4 py-3 w-1/4">Quantity</th>
                      <th className="px-4 py-3 w-1/4">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {warehouse.location_item.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-4 text-gray-400 text-center"
                        >
                          No items in stock.
                        </td>
                      </tr>
                    ) : (
                      warehouse.location_item.map((item) => (
                        <tr
                          key={item.item_id}
                          className="bg-white hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            {item.material_item.item_name}
                          </td>
                          <td className="px-4 py-3">{item.quantity ?? "—"}</td>
                          <td className="px-4 py-3">
                            {item.material_item.unit ?? "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
