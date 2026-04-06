  import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type NavItem = {
  label: string;
  path: string;
};

// Add or remove links per role here
const navConfig: Record<string, NavItem[]> = {
  jobsite_logistic: [
    { label: "Dashboard", path: "/dashboard/jobsite" },
    { label: "Inventory", path: "/inventory" },
    { label: "Requests", path: "/requests"}
  ],
  warehouse_logistic: [
    { label: "Dashboard", path: "/dashboard/warehouse" },
    { label: "Inventory", path: "/inventory" },
  ],
  project_manager: [
    { label: "Dashboard", path: "/dashboard/manager" },
    { label: "Inventory", path: "/inventory" },
    { label: "Requests", path: "/requests"}

  ],
  system_administrator: [
    { label: "Dashboard", path: "/dashboard/admin" },
    { label: "Inventory", path: "/inventory" },
  ],
};

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.[0]?.role;
  const links = navConfig[role] ?? [];

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      {/* Desktop — top bar */}
      <nav className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <span className="font-bold text-primary text-2xl">MEC²</span>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-md font-medium ${isActive ? "text-secondary" : "text-gray-600 hover:text-secondary"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="text-md text-gray-500 hover:text-red-500 transition-colors hover:cursor-pointer"
        >
          Logout
        </button>
      </nav>

      {/* Mobile — bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center text-md font-medium px-3 py-1 ${
                isActive ? "text-secondary" : "text-gray-500 hover:text-secondary"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-md font-medium px-3 py-1 text-gray-500 hover:text-red-500 hover:cursor-pointer"
        >
          Logout
        </button>
      </nav>
    </>
  );
}
