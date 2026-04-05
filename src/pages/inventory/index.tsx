import { useQuery } from "@tanstack/react-query";
import { Dropdown } from "../../components/Dropdown";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AddLocationModal } from "../../components/modals/AddLocationModal";

type MaterialItem = {
  item_id: string;
  item_name: string;
  unit: string | null;
};

type LocationItem = {
  item_id: string;
  quantity: number | null;
  material_item: MaterialItem;
};

type Location = {
  location_id: string;
  location_name: string | null;
  address: string | null;
  is_active: boolean | null;
  location_item: LocationItem[];
};

async function fetchLocations(): Promise<Location[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/location`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.data;
}

export function Inventory() {
  const {
    data: locations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });
  
  const [selectedId, setSelectedId] = useState("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const selected = locations?.find((l) => l.location_id === selectedId);
  const { user } = useAuth();
  const manager = user[0].role === "project_manager";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading inventory...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Failed to load inventory.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-primary">Inventory</h1>

      <Dropdown
        options={locations?.map((l) => ({ value: l.location_id, label: l.location_name ?? "" })) ?? []}
        value={selectedId}
        onChange={setSelectedId}
        placeholder="Select a location"
      />

      {!selected && (
        <p className="text-gray-400 text-center mt-12">
          Select a location to view inventory.
        </p>
      )}
      {selected && (
        <div>
          <p className="py-3 font-bold text-secondary capitalize text-l">
            {selected.location_name} | {selected.address}
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 w-1/2">Material</th>
                  <th className="px-4 py-3 w-1/4">Quantity</th>
                  <th className="px-4 py-3 w-1/4">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selected.location_item.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-4 text-gray-400 text-center"
                    >
                      No items at this location.
                    </td>
                  </tr>
                ) : (
                  selected.location_item.map((item) => (
                    <tr
                      key={item.item_id}
                      className="bg-white hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        {item.material_item.item_name}
                      </td>
                      <td className="px-4 py-3">{item.quantity ?? "—"}</td>
                      <td className="px-4 py-3">
                        {item.material_item.unit ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {manager && (
        <div className="flex items-center justify-center">
          <button className="border-secondary border-3 px-3 py-3 rounded-md hover:cursor-pointer hover:bg-gray-100 text-secondary"
          onClick={() => {
            setShowModal(true);
          }}
          >
            Add Location
          </button>
          <AddLocationModal open={showModal} onClose={() => setShowModal(false)} />

        </div>
      )}
    </div>
  );
}
