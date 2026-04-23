import { useQuery } from "@tanstack/react-query";
import type { PayOrder } from "../../../../types/typedefs";

async function fetchRecentOrders(): Promise<PayOrder[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/orders/?limit=2`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await res.json();
  return data.data;
}

export function RecentPayOrders() {
  const {data, isLoading} = useQuery({
    queryKey: ["orders", "recent"],
    queryFn: fetchRecentOrders
  });




  function getStatusColor(status: string) {
    switch (status) {
      case "created": return "bg-yellow-100 text-yellow-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-primary">Recent Pay Orders</h2>
        <a href="/orders" className="text-sm text-secondary hover:underline">View all</a>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : !data?.length ? (
        <p className="text-gray-400 text-sm">No recent pay orders.</p>
      ) : (
        <div className="space-y-3">
          {data.map((order) => (
            <div key={order.po_id} className="bg-white rounded-lg shadow p-4 border-l-4 border-l-primary">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-primary">{order.po_number}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                {order.pay_order_item.map((item, i) => (
                  <p key={i}>{item.material_item.item_name} — {item.quantity} {item.material_item.unit ?? ""}</p>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
