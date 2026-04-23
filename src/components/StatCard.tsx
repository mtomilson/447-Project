

type CardProps = {
    label: string,
    value: number,
    color: string,
}

export function StatCard({ label, value, color }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className={`text-3xl font-bold ${color}`}>
        {value}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        {label}
      </p>
    </div>
  );
}
