import { useState } from "react";
import type { PayOrder } from "../../types/typedefs";
import { PhotoCapture } from "../PhotoCapture";

type Props = {
  order: PayOrder;
  onClose: () => void;
  isLoading: boolean;
  onConfirm: (files: File[]) => void;
};

export function ShippingModal({ order, onClose, isLoading, onConfirm }: Props) {
  const [photos, setPhotos] = useState<File[]>([]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-primary">Confirm Shipment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Take photos of the packing slip and pallet condition.
        </p>

        <PhotoCapture onChange={setPhotos} />

        <button
          onClick={() => onConfirm(photos)}
          disabled={photos.length === 0 || isLoading}
          className="w-full py-3 mt-6 bg-secondary text-white font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Confirming..." : "Confirm Shipment"}
        </button>
      </div>
    </div>
  );
}
