import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchActivityLog } from "../../lib/tanstack/activity";

const PAGE_SIZE = 10;

export function ActivityFeedPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["activity", "all"],
    queryFn: () => fetchActivityLog(1000),
  });

  const totalPages = Math.ceil((data?.length ?? 0) / PAGE_SIZE);
  const paginated = data?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-primary mb-1">Activity Feed</h1>
      <p className="text-sm text-gray-500 mb-6">All recent order activity</p>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : !data?.length ? (
        <p className="text-gray-400 text-sm">No activity yet.</p>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {paginated.map((log) => (
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

          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
