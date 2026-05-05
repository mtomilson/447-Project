import { useQuery } from "@tanstack/react-query";
import { fetchActivityLog } from "../../lib/tanstack/activity";

export function ActivityFeedPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["activity"],
    queryFn: fetchActivityLog,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-primary mb-1">Activity Feed</h1>
      <p className="text-sm text-gray-500 mb-6">All recent order activity</p>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : !data?.length ? (
        <p className="text-gray-400 text-sm">No activity yet.</p>
      ) : (
        <div className="space-y-3">
          {data.map((log) => (
            <div
              key={log.log_id}
              className="bg-white rounded-lg shadow p-4 flex items-start gap-3"
            >
              <span className="mt-1 w-2 h-2 rounded-full bg-secondary shrink-0" />
              <div>
                <p className="text-sm text-gray-700">{log.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
