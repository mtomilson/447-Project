import { useState } from "react";
import type { Location } from "../../../../types/typedefs";
import { Dropdown } from "../../../../components/Dropdown";

type Props = {
  locations: Location[];
  onSave: (id: string) => void;
};

export function JobsitePicker({ locations, onSave }: Props) {
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    const token = localStorage.getItem("token");
    await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ home_jobsite_id: selected }),
    });
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      if (Array.isArray(u) && u[0]) u[0].home_jobsite_id = selected;
      localStorage.setItem("user", JSON.stringify(u));
    }
    setSaving(false);
    onSave(selected);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-primary mb-2">Welcome</h1>
        <p className="text-gray-500 text-sm mb-6">
          Select your home jobsite to get started.
        </p>
        <div className="mb-4">
          <Dropdown
            options={locations
              .filter((l) => !l.location_name?.toLowerCase().includes("warehouse"))
              .map((l) => ({ value: l.location_id, label: l.location_name ?? "" }))}
            value={selected}
            onChange={setSelected}
            placeholder="-- Choose a jobsite --"
            emptyMessage="No jobsites available"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={!selected || saving}
          className="w-full bg-primary text-white py-2 rounded-md text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {saving ? "Saving..." : "Save Jobsite"}
        </button>
      </div>
    </div>
  );
}
