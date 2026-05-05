type Props = {
  locationName: string;
  userName: string;
  onChangeJobsite: () => void;
};

export function JobsiteHeader({ locationName, userName, onChangeJobsite }: Props) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">My Jobsite</h1>
        <p className="text-sm text-secondary font-medium">
          {locationName} · {userName}
        </p>
      </div>
      <button
        onClick={onChangeJobsite}
        className="text-xs text-gray-400 hover:text-gray-600 underline mt-1"
      >
        Change
      </button>
    </div>
  );
}
