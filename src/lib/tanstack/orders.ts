import type { PayOrder } from "../../types/typedefs";
import { supabase } from "../../lib/supabase/supabaseClient";

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
  photoPaths?: string[],
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
      body: JSON.stringify({ newStatus, receivedItems, photoPaths }),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function uploadPhotos(
  poId: string,
  files: File[],
  eventContext: "order_shipped" | "order_delivered",
): Promise<string[]> {
  const paths = await Promise.all(
    files.map(async (file) => {
      const path = `${poId}/${eventContext}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("photos")
        .upload(path, file);
      if (error) throw new Error(error.message);
      return path;
    }),
  );
  return paths;
}
