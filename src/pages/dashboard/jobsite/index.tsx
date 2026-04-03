import { useNavigate } from "react-router-dom";

export function JobsiteDashboard() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#013868" }}>
        Jobsite Dashboard
      </h1>
      <div className="grid gap-4">
        <button
          onClick={() => navigate("/dashboard/jobsite/requests")}
          className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow border-l-4"
          style={{ borderLeftColor: "#7AC142" }}
        >
          <h2 className="text-lg font-semibold" style={{ color: "#013868" }}>
            Material Requests
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            View and submit material requests
          </p>
        </button>
      </div>
    </div>
  );
}