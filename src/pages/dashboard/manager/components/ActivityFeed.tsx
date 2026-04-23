import { useQuery } from "@tanstack/react-query";
import type { ActivityLog } from "../../../../types/typedefs";
import { Link } from "react-router-dom"

async function fetchActivityLog(): Promise<ActivityLog[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/activity`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data.data;
}

export function ActivityFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ["activity"],
    queryFn: fetchActivityLog,
  });

  return (
     <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-primary">Activity Feed</h2>
        <Link to="/orders" className="text-sm text-secondary hover:underline">View all</Link>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : !data?.length ? (
        <p className="text-gray-400 text-sm">No recent activity.</p>
      ) : (
        <div className="space-y-3">
          {data.map((log) => (
            <div key={log.log_id} className="bg-white rounded-lg shadow p-4 flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-secondary shrink-0" />
              <div>
                <p className="text-sm text-gray-700">{log.description}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(log.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
