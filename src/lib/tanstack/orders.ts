import type { PayOrder } from "../../types/typedefs";

export async function fetchOrders(): Promise<PayOrder[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data;
}

export async function updateStatus(
  po_id: string,
  newStatus: string,
  receivedItems?: { po_item_id: string; received_quantity: number }[],
) {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/orders/${po_id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newStatus, receivedItems }),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}