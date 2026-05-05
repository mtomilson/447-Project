import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AddPayOrderModal from "../../components/modals/AddPayOrderModal";
import { useAuth } from "../../context/AuthContext";
import { Dropdown } from "../../components/Dropdown";
import type { PayOrder } from "../../types/typedefs";
import toast from "react-hot-toast";
import DeliveryConfirmedModal from "../../components/modals/DeliveryConfirmedModal";
import { fetchLocations } from "../../lib/tanstack/locations";
import { fetchOrders } from "../../lib/tanstack/orders";
import { updateStatus } from "../../lib/tanstack/orders";
import { ShippingModal } from "../../components/modals/ShippingConfirmModal";
import { uploadPhotos } from "../../lib/tanstack/orders";
import { StorageImage } from "../../components/StorageImage";

export default function OrdersPage() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmOrder, setConfirmOrder] = useState<PayOrder | null>(null);
  const [confirmShipping, setConfirmShipping] = useState<PayOrder | null>(null);

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const role = user?.[0]?.role;

  const updateOrder = useMutation({
    mutationFn: ({
      po_id,
      newStatus,
      receivedItems,
      photoPaths,
    }: {
      po_id: string;
      newStatus: string;
      receivedItems?: { po_item_id: string; received_quantity: number }[];
      photoPaths?: string[];
    }) => updateStatus(po_id, newStatus, receivedItems, photoPaths),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Status updated");
      setConfirmOrder(null);
      setConfirmShipping(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  function getLocationName(id: string | null) {
    if (!id) return "-";
    return (
      locations?.find((loc) => loc.location_id === id)?.location_name ?? "-"
    );
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "created":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function getStatusActions(role: string, order: PayOrder) {
    if (
      role === "warehouse_logistic" &&
      order.status === "created" &&
      order.source_location_id
    ) {
      return [
        {
          label: "Mark as Shipped",
          action: () => setConfirmShipping(order),
        },
      ];
    }

    if (role === "jobsite_logistic") {
      if (order.status === "shipped") {
        return [
          { label: "Mark as Delivered", action: () => setConfirmOrder(order) },
        ];
      }
      if (order.status === "created" && !order.source_location_id) {
        return [
          { label: "Mark as Delivered", action: () => setConfirmOrder(order) },
        ];
      }
    }
    return [];
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary">Pay Orders</h1>
        {role === "project_manager" && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-white font-semibold rounded-md hover:opacity-90 transition-opacity bg-secondary"
          >
            + New Pay Order
          </button>
        )}
      </div>

      <div className="mb-6">
        <Dropdown
          options={[
            { value: "all", label: "All" },
            { value: "created", label: "Created" },
            { value: "shipped", label: "Shipped" },
            { value: "delivered", label: "Delivered" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by status"
        />
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-center mt-10">Loading pay orders...</p>
      ) : orders?.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No pay orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders
            ?.filter(
              (order) =>
                statusFilter === "all" || order.status === statusFilter,
            )
            ?.map((order) => (
              <div
                key={order.po_id}
                className="bg-white rounded-lg shadow p-4 border-l-4 border-l-primary"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">
                      {order.po_number}
                    </span>
                    {order.vendor && (
                      <span className="text-sm text-gray-500">
                        {order.vendor}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="text-sm text-gray-500 mb-2">
                  {order.source_location_id && (
                    <>
                      <span>
                        From: {getLocationName(order.source_location_id)}
                      </span>
                      <span className="mx-2">→</span>
                    </>
                  )}

                  <span>
                    To: {getLocationName(order.destination_location_id)}
                  </span>
                </div>

                <div className="text-sm text-gray-700 space-y-1">
                  {order.pay_order_item.map((item, i) => (
                    <p key={i}>
                      {item.material_item.item_name} — {item.quantity}{" "}
                      {item.material_item.unit || ""}
                    </p>
                  ))}
                </div>
                {order.has_missing_items && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold text-red-600">
                      Missing Items:
                    </p>
                    {order.pay_order_item
                      .filter(
                        (item) =>
                          item.received_quantity !== null &&
                          item.received_quantity < item.quantity,
                      )
                      .map((item) => (
                        <p
                          key={item.po_item_id}
                          className="text-xs text-red-500"
                        >
                          {item.material_item.item_name} —{" "}
                          {item.quantity - item.received_quantity!}{" "}
                          {item.material_item.unit ?? ""} missing
                        </p>
                      ))}
                  </div>
                )}

                {order.order_photos?.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {order.order_photos.map((photo, i) => (
                      <div key={i} className="w-16 h-16 shrink-0">
                        <StorageImage storagePath={photo.storage_path} />
                      </div>
                    ))}
                  </div>
                )}

                {order.notes && (
                  <p className="text-xs text-gray-400 mt-2 italic">
                    {order.notes}
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  {getStatusActions(role, order).map((action) => (
                    <button
                      key={action.label}
                      onClick={action.action}
                      className="px-3 py-1 text-xs font-semibold text-white rounded-md hover:opacity-90 transition-opacity bg-secondary"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>

                {order.signed && (
                  <div className="flex items-center gap-1 mt-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-1.5 w-fit">
                    <span>✓ Marked as Delivered by</span>
                    <span className="font-semibold">{order.signer?.name}</span>
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-2">
                  {new Date(order.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
        </div>
      )}
      {confirmOrder && (
        <DeliveryConfirmedModal
          order={confirmOrder}
          onClose={() => setConfirmOrder(null)}
          isLoading={updateOrder.isPending}
          onConfirm={async (receivedItems, files) => {
            const paths = await uploadPhotos(
              confirmOrder.po_id,
              files,
              "order_delivered",
            );
            updateOrder.mutate({
              po_id: confirmOrder.po_id,
              newStatus: "delivered",
              receivedItems,
              photoPaths: paths,
            });
          }}
        />
      )}

      {confirmShipping && (
        <ShippingModal
          order={confirmShipping}
          onClose={() => setConfirmShipping(null)}
          isLoading={updateOrder.isPending}
          onConfirm={async (files) => {
            const paths = await uploadPhotos(
              confirmShipping.po_id,
              files,
              "order_shipped",
            );
            updateOrder.mutate({
              po_id: confirmShipping.po_id,
              newStatus: "shipped",
              photoPaths: paths,
            });
          }}
        />
      )}

      {showModal && (
        <AddPayOrderModal
          onClose={() => setShowModal(false)}
          locations={locations ?? []}
        />
      )}
    </div>
  );
}
