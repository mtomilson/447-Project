import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { fetchOrders } from "../../../lib/tanstack/orders";
import { fetchLocations } from "../../../lib/tanstack/locations";
import { JobsitePicker } from "./components/JobsitePicker";
import { JobsiteHeader } from "./components/JobsiteHeader";
import { JobsiteStats } from "./components/JobsiteStats";
import { IncomingOrders } from "./components/IncomingOrders";
import { InventorySnapshot } from "./components/InventorySnapshot";
import { ActivityFeed } from "../manager/components/ActivityFeed";

export function JobsiteDashboard() {
  const { user } = useAuth();
  const [homeJobsiteId, setHomeJobsiteId] = useState<string | null>(
    user?.[0]?.home_jobsite_id ?? null,
  );

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });
  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  if (!homeJobsiteId) {
    return (
      <JobsitePicker locations={locations ?? []} onSave={setHomeJobsiteId} />
    );
  }

  const homeLocation = locations?.find((l) => l.location_id === homeJobsiteId);

  const incomingOrders =
    orders?.filter(
      (o) =>
        o.destination_location_id === homeJobsiteId &&
        (o.status === "shipped" ||
          (o.status === "created" && o.source_location_id === null)),
    ) ?? [];

  const today = new Date().toISOString().split("T")[0];
  const expectedToday =
    orders?.filter(
      (o) =>
        o.destination_location_id === homeJobsiteId &&
        o.expected_delivery?.startsWith(today),
    ).length ?? 0;

  const thisMonth = new Date().toISOString().slice(0, 7);
  const deliveredThisMonth =
    orders?.filter(
      (o) =>
        o.destination_location_id === homeJobsiteId &&
        o.status === "delivered" &&
        o.created_at.startsWith(thisMonth),
    ).length ?? 0;

  const totalItems =
    homeLocation?.location_item?.reduce(
      (acc, item) => acc + (item.quantity ?? 0),
      0,
    ) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <JobsiteHeader
        locationName={homeLocation?.location_name ?? ""}
        userName={user?.[0]?.name ?? ""}
        onChangeJobsite={() => setHomeJobsiteId(null)}
      />
      <JobsiteStats
        incomingOrders={incomingOrders.length}
        expectedToday={expectedToday}
        deliveredThisMonth={deliveredThisMonth}
        totalItems={totalItems}
      />
      <IncomingOrders orders={incomingOrders} locations={locations ?? []} />
      <InventorySnapshot
        items={homeLocation?.location_item ?? []}
        locationName={homeLocation?.location_name ?? ""}
        address={homeLocation?.address ?? null}
      />
      <ActivityFeed />
    </div>
  );
}
