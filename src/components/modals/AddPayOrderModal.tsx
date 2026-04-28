import { useState } from "react";
import type { Location } from "../../types/typedefs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "../Dropdown";
import toast from "react-hot-toast";
import { MaterialAutocomplete } from "../MaterialAutocomplete";

type AddPayOrderModalProps = {
  onClose: () => void;
  locations: Location[];
};

type CartItem = {
  item_name: string;
  unit: string;
  quantity: number;
};

async function createPayOrder(body: {
  vendor: string;
  source_location_id: string | null;
  destination_location_id: string;
  po_number: string;
  notes: string;
  items: CartItem[];
  expectedDelivery: string;
}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export default function AddPayOrderModal({
  onClose,
  locations,
}: AddPayOrderModalProps) {
  const [vendor, setVendor] = useState("");
  const [po_number, setPoNumber] = useState("");
  const [sourceLocationId, setSourceLocationId] = useState("");
  const [destinationLocationId, setDestinationLocationId] = useState("");
  const [notes, setNotes] = useState("");
  const [itemName, setItemName] = useState("");
  const [unit, setUnit] = useState("");
  const [expectedDelivery, setExepectedDelivery] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [formError, setFormError] = useState("");
  const queryClient = useQueryClient();

  const addOrder = useMutation({
    mutationFn: createPayOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Pay order created!");
      onClose();
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();

    if (!itemName.trim()) {
      setFormError("Please enter a material name.");
      return;
    }
    if (!unit.trim()) {
      setFormError("Please enter a unit.");
      return;
    }
    if (
      cartItems.find(
        (i) => i.item_name.toLowerCase() === itemName.toLowerCase(),
      )
    ) {
      setFormError("Item already in cart.");
      return;
    }

    setCartItems([
      ...cartItems,
      { item_name: itemName.trim(), unit: unit.trim(), quantity },
    ]);
    setItemName("");
    setUnit("");
    setQuantity(1);
    setFormError("");
  }

  function handleSubmit() {
    if (!destinationLocationId) {
      setFormError("Please select a destination location.");
      return;
    }
    if (cartItems.length === 0) {
      setFormError("Please add at least one item.");
      return;
    }
    if (!po_number) {
      setFormError("Please Enter a PO Number.");
      return;
    }

    addOrder.mutate({
      vendor,
      po_number,
      source_location_id: sourceLocationId || null,
      destination_location_id: destinationLocationId,
      notes,
      items: cartItems,
      expectedDelivery
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary">New Pay Order</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. Home Depot"
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PO Number{" "}
            </label>
            <input
              type="text"
              value={po_number}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="e.g. PO-11234"
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From (Warehouse){" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Dropdown
              options={locations.map((loc) => ({
                value: loc.location_id,
                label: loc.location_name ?? "",
              }))}
              value={sourceLocationId}
              onChange={setSourceLocationId}
              placeholder="Select warehouse"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To (Destination)
            </label>
            <Dropdown
              options={locations.map((loc) => ({
                value: loc.location_id,
                label: loc.location_name ?? "",
              }))}
              value={destinationLocationId}
              onChange={setDestinationLocationId}
              placeholder="Select destination"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Delivery{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={expectedDelivery}
              onChange={(e) => setExepectedDelivery(e.target.value)}
              placeholder="Select Expected Delivery Date"
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes"
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
            />
          </div>

          <hr className="border-gray-200" />

          <p className="text-sm font-semibold text-gray-600">Add Materials</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material Name
            </label>
            <MaterialAutocomplete
              value={itemName}
              onChange={setItemName}
              onSelect={(item) => {
                setItemName(item.item_name);
                setUnit(item.unit ?? "");
              }}
              placeholder="e.g. Concrete"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. bags"
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          {formError && (
            <p className="text-red-500 text-sm text-center">{formError}</p>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-2 border-2 border-secondary text-secondary font-semibold rounded-md hover:bg-secondary hover:text-white transition-colors"
          >
            + Add to Order
          </button>

          {cartItems.length > 0 && (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <p className="text-xs font-semibold text-gray-500 uppercase px-3 py-2 bg-gray-50">
                Order
              </p>
              <ul className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <li
                    key={item.item_name}
                    className="flex items-center justify-between px-3 py-2 text-sm text-gray-700"
                  >
                    <span>
                      {item.item_name} ({item.unit})
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">x{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCartItems(
                            cartItems.filter(
                              (i) => i.item_name !== item.item_name,
                            ),
                          )
                        }
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
            type="button"
            onClick={handleSubmit}
            disabled={addOrder.isPending}
            className="w-full py-3 bg-secondary text-white font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {addOrder.isPending ? "Submitting..." : "Submit Pay Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
