import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
};

// this function gets called inside of the component's tanstack mutate call

async function createLocation(body: {
  location_name: string;
  address: string;
}) {
  const token = localStorage.getItem("token"); // pulls user's token from local storage
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/location/create`,
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

export function AddLocationModal({ open, onClose }: Props) {
  if (!open) return null;
  const [locationName, setLocationName] = useState<string>("");
  const [address, setAddress] = useState("");
  const [formError, setFormError] = useState("");
  const queryClient = useQueryClient();

  // useMutation is used for creating or updating the database, takes an object as a paramater that contains a list of things you can add
  // mutationFn: is the function that is called when you call addLocation()
  // onSuccess: is a function that occurs when the mutate is successful
  // onError: is a function that occurs when the mutate fails

  const addLocation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Location Added!");
      onClose();
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    addLocation.mutate({ location_name: locationName, address: address }); // calls the mutate
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-primary mb-4">
          Add Location
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Name
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
              placeholder="e.g. Warehouse A"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="e.g. 123 Main St"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary placeholder:text-gray-400"
            />
          </div>

          {formError && <p className="text-red-500 text-sm">{formError}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addLocation.isPending}
              className="flex-1 py-2 bg-secondary text-white rounded-md hover:opacity-90 disabled:opacity-50 hover:cursor-pointer"
            >
              {addLocation.isPending ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
