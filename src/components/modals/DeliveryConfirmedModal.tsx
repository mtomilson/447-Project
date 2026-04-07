import { useState } from "react";
import type { PayOrder } from "../../types/requests";

type Props = {
  order: PayOrder;
  onClose: () => void;
  onConfirm: (
    receivedItems: { po_item_id: string; received_quantity: number }[],
  ) => void;
};

export default function DeliveryConfirmedModal({
  order,
  onClose,
  onConfirm,
}: Props) {
  const [received, setReceived] = useState<Record<string, number>>(
    Object.fromEntries(
      order.pay_order_item.map((item) => [item.po_item_id, item.quantity]),
    ),
  );

  function handleSubmit() {
    const receivedItems = order.pay_order_item.map((item) => ({
      po_item_id: item.po_item_id,
      received_quantity: received[item.po_item_id] ?? item.quantity,
    }));
    onConfirm(receivedItems);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary">Confirm Delivery</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <p className="text-sm text-gray-500 mb-4">Enter the quantity actually received for each item.</p>

        <div className="space-y-3 mb-6">
          {order.pay_order_item.map((item) => (
            <div key={item.po_item_id} className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{item.material_item.item_name}</p>
                <p className="text-xs text-gray-400">Expected: {item.quantity} {item.material_item.unit ?? ""}</p>
              </div>
              <input
                type="number"
                min={0}
                max={item.quantity}
                value={received[item.po_item_id] ?? item.quantity}
                onChange={(e) =>
                  setReceived({ ...received, [item.po_item_id]: Number(e.target.value) })
                }
                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm text-center focus:outline-none focus:ring-2"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-secondary text-white font-semibold rounded-md hover:opacity-90 transition-opacity"
        >
          Confirm Delivery
        </button>
      </div>
    </div>
  );
}
