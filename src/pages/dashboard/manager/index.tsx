import { StatCard } from "../../../components/StatCard";
import { useQuery } from "@tanstack/react-query";
import type { Stats } from "../../../types/requests";

async function fetchStats(): Promise<Stats> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data;
}

export function ManagerDashboard() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  if(error) return <p>error</p>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-primary mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Project Manager</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Open Pay Orders"
          value={data?.openOrders ?? 0}
          color="text-secondary"
        />
        <StatCard
          label="Low Stock Flags"
          value={data?.lowStock ?? 0}
          color="text-red-500"
        />
        <StatCard
          label="Delivered Today"
          value={data?.deliveredToday ?? 0}
          color="text-primary"
        />
         <StatCard
          label="Orders with Missing Items"
          value={data?.missingItems ?? 0}
          color="text-orange-500"
        />
      </div>
    </div>
  );
}
