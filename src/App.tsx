import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/login";
import { ProtectedRoute } from "./lib/helper/ProtectedRoute";
import { JobsiteDashboard } from "./pages/dashboard/jobsite/index";
import { WarehouseDashboard } from "./pages/dashboard/warehouse/index";
import { ManagerDashboard } from "./pages/dashboard/manager/index";
import { AdminDashboard } from "./pages/dashboard/admin/index";
import RequestsPage from "./pages/requests";
import OrdersPage from "./pages/orders";
import { Inventory } from "./pages/inventory/index";
import { Layout } from "./components/Layout";
import { Toaster } from "react-hot-toast";
import { ActivityFeedPage } from "./pages/activityfeed";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Layout />
        <div className="pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute role="jobsite_logistic" />}>
            <Route path="/dashboard/jobsite" element={<JobsiteDashboard />} />
          </Route>
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/orders" element={<OrdersPage />} />

          <Route element={<ProtectedRoute role="warehouse_logistic" />}>
            <Route
              path="/dashboard/warehouse"
              element={<WarehouseDashboard />}
            />
          </Route>

          <Route element={<ProtectedRoute role="project_manager" />}>
            <Route path="/dashboard/manager" element={<ManagerDashboard />} />
          </Route>

          <Route element={<ProtectedRoute role="system_administrator" />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/inventory" element={<Inventory />} />
          </Route>

          <Route element={<ProtectedRoute/>}>
            <Route path="/feed" element={<ActivityFeedPage/>} />
          </Route>

        </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
