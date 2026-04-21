import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
type MaterialItem = {
  item_id: string;
  item_name: string;
  unit: string | null;
};

type Props = {
    value: string;
    onChange: (value: string) => void;
    onSelect?: (item: MaterialItem) => void;
}

async function fetchMaterials(): Promise<MaterialItem[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/material`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error);

  return data.data;
}

export function MaterialAutocomplete({value, onChange, onSelect}: Props) {
  const { data } = useQuery({
    queryKey: ["materials"],
    queryFn: fetchMaterials,
  });

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = value.trim()
    ? (data ?? []).filter((m) =>
        m.item_name.toLowerCase().includes(value.trim().toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        placeholder="e.g. Concrete"
        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((item) => (
            <li
              key={item.item_id}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(item.item_name);
                onSelect?.(item);
                setOpen(false);
              }}
              className="px-3 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-50"
            >
              <span className="font-medium">{item.item_name}</span>
              {item.unit && (
                <span className="ml-2 text-xs text-gray-400">{item.unit}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
