import { useState } from "react";
import type { Location } from "../../types/requests";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "../Dropdown";
import toast from "react-hot-toast";

type AddRequestModalProps = {
  onClose: () => void;
  locations: Location[];
};

async function createRequest(body: {
  requested_to: string;
  requested_from: string;
  items: { item_id: string; quantity: number }[];
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

export default function AddRequestModal({
  onClose,
  locations,
}: AddRequestModalProps) {
  const [requestedFrom, setRequestedFrom] = useState("");
  const [requestedTo, setRequestedTo] = useState("");
  const queryClient = useQueryClient();
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [requestItems, setRequestItems] = useState<
    { item_id: string; quantity: number }[]
  >([]); // shopping cart, an array of objects
  const [formError, setFormError] = useState("");

  const addRequest = useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Successfully Created Request!");
      onClose();
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    setRequestItems([...requestItems, { item_id: itemId, quantity: quantity }]);
    setItemId("");
    setQuantity(1);
  }

  async function handleSubmit() {
    addRequest.mutate({
      requested_to: requestedTo,
      requested_from: requestedFrom,
      items: requestItems,
    });
    setRequestedFrom("");
    setRequestedTo("");
    setRequestItems([]);
  }

  async function handleCartRemove(removedId: string) {
    setRequestItems(requestItems.filter((i) => i.item_id !== removedId));
  }

  const fromMaterials = locations
    ?.find((loc) => loc.location_id === requestedFrom)
    ?.location_item.map((item) => {
      return {
        item_id: item.item_id,
        item_name: item.material_item.item_name,
        unit: item.material_item.unit,
      };
    });

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-8">
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary">New Request</h2>
            <button
              onClick={onClose}
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
                options={
                  locations?.map((loc) => ({
                    value: loc.location_id,
                    label: loc.location_name ?? "",
                  })) ?? []
                }
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
                options={
                  locations?.map((loc) => ({
                    value: loc.location_id,
                    label: loc.location_name ?? "",
                  })) ?? []
                }
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
                options={
                  fromMaterials?.map((mat) => ({
                    value: mat.item_id,
                    label: `${mat.item_name}${mat.unit ? ` (${mat.unit})` : ""}`,
                  })) ?? []
                }
                value={itemId}
                onChange={setItemId}
                placeholder="Select material"
                required
                emptyMessage={"No materials at selected location"}
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
              <p className="text-red-500 text-sm text-center">{formError}</p>
            )}
            <button
              type="button"
              onClick={(e) => handleAddToCart(e)}
              className="w-full py-2 border-2 border-secondary text-secondary font-semibold rounded-md hover:bg-secondary hover:text-white transition-colors"
            >
              + Add to Cart
            </button>
            {requestItems.length > 0 && (
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <p className="text-xs font-semibold text-gray-500 uppercase px-3 py-2 bg-gray-50">
                  Cart
                </p>
                <ul className="divide-y divide-gray-100">
                  {requestItems.map((item) => (
                    <li
                      key={item.item_id}
                      className="flex items-center justify-between px-3 py-2 text-sm text-gray-700"
                    >
                      <span>
                        {
                          fromMaterials?.find(
                            (mat) => mat.item_id === item.item_id,
                          )?.item_name
                        }
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">x{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleCartRemove(item.item_id)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={addRequest.isPending}
              className="w-full py-3 bg-secondary text-white font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {addRequest.isPending ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </>
      </div>
    </div>
  );
}
