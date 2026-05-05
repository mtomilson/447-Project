import { Link } from "react-router-dom";
import type { PayOrder, Location } from "../../../../types/typedefs";

type Props = {
  orders: PayOrder[];
  locations: Location[];
};

const statusStyle: Record<string, string> = {
  shipped: "bg-purple-100 text-purple-800",
  created: "bg-yellow-100 text-yellow-800",
};

export function IncomingOrders({ orders, locations }: Props) {
  function getLocationName(id: string | null) {
    if (!id) return "—";
    return locations.find((l) => l.location_id === id)?.location_name ?? "—";
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-primary">Incoming Orders</h2>
        <Link to="/orders" className="text-sm text-secondary hover:underline">
          View all
        </Link>
      </div>
      {orders.length === 0 ? (
        <p className="text-gray-400 text-sm">No incoming orders.</p>
      ) : (
        <div className="space-y-3">
          {orders.slice(0, 5).map((order) => (
            <div
              key={order.po_id}
              className="bg-white rounded-lg shadow p-4 border-l-4 border-l-primary"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-primary">
                  {order.po_number}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyle[order.status] ?? ""}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              {order.source_location_id && (
                <p className="text-sm text-gray-500 mb-2">
                  From: {getLocationName(order.source_location_id)}
                </p>
              )}
              <p className="text-sm text-gray-500 mb-2">
                To: {getLocationName(order.destination_location_id)}
              </p>
              <div className="text-sm text-gray-700 space-y-1">
                {order.pay_order_item.map((item, i) => (
                  <p key={i}>
                    {item.material_item.item_name} — {item.quantity}{" "}
                    {item.material_item.unit ?? ""}
                  </p>
                ))}
              </div>
              {order.expected_delivery && (
                <p className="text-xs text-gray-400 mt-2">
                  ETA:{" "}
                  {order.expected_delivery
                    ? new Date(
                        order.expected_delivery + "T00:00:00",
                      ).toLocaleDateString()
                    : "—"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
