import type { Location } from "../../types/typedefs";

export async function fetchLocations(): Promise<Location[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/location`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if(!res.ok) throw new Error(data.error)
  return data.data;
}
