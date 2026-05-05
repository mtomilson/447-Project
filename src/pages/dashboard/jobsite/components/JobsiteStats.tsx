import { StatCard } from "../../../../components/StatCard";

type Props = {
  incomingOrders: number;
  expectedToday: number;
  deliveredThisMonth: number;
  totalItems: number;
};

export function JobsiteStats({
  incomingOrders,
  expectedToday,
  deliveredThisMonth,
  totalItems,
}: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard label="Incoming orders" value={incomingOrders} color="text-orange-500" />
      <StatCard label="Expected deliveries today" value={expectedToday} color="text-red-500" />
      <StatCard label="Delivered this month" value={deliveredThisMonth} color="text-secondary" />
      <StatCard label="Total items on site" value={totalItems} color="text-primary" />
    </div>
  );
}
