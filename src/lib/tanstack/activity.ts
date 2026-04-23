import type { ActivityLog } from "../../types/typedefs";

export async function fetchActivityLog(): Promise<ActivityLog[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/activity`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data.data;
}