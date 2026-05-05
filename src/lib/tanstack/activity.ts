import type { ActivityLog } from "../../types/typedefs";

export async function fetchActivityLog(limit?: number): Promise<ActivityLog[]> {
  const token = localStorage.getItem("token");
  const url = limit
    ? `${import.meta.env.VITE_API_URL}/api/activity?limit=${limit}`
    : `${import.meta.env.VITE_API_URL}/api/activity`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data.data;
}