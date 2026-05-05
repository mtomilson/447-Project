import { Link } from "react-router-dom";
import type { Location } from "../../../../types/typedefs";

type Props = {
  items: Location["location_item"];
  locationName: string;
  address: string | null;
};

export function InventorySnapshot({ items, locationName, address }: Props) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-primary">Site Inventory Snapshot</h2>
        <Link to="/inventory" className="text-sm text-secondary hover:underline">
          View all
        </Link>
      </div>
      <p className="text-sm font-medium text-secondary mb-3">
        {locationName}
        {address ? ` | ${address}` : ""}
      </p>
      {items.length === 0 ? (
        <p className="text-gray-400 text-sm">No inventory at this site.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">Material</th>
                <th className="text-left px-4 py-3">Qty</th>
                <th className="text-left px-4 py-3">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.item_id}>
                  <td className="px-4 py-3 text-gray-800">
                    {item.material_item.item_name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item.quantity ?? 0}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {item.material_item.unit ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
