import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaClipboardList, FaBox } from "react-icons/fa";

const OwnerLayout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Active link styling
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? "bg-amber-700/80 font-semibold ring-2 ring-yellow-300/60"
        : "hover:bg-amber-500/70"
    } text-white`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => navigate("/owner")}
        >
          <img src="/logooo.png" alt="Logo" className="w-12 h-12 object-contain" />
          <h1 className="text-xl font-bold drop-shadow-sm">Owner Panel</h1>
        </div>

        <div className="flex gap-4 items-center">
          <NavLink to="/owner" end className={linkClass}>
            <FaTachometerAlt /> Dashboard
          </NavLink>
          <NavLink to="/owner/employees" className={linkClass}>
            <FaUsers /> Employees
          </NavLink>
          <NavLink to="/owner/all-orders" className={linkClass}>
            <FaClipboardList /> Orders
          </NavLink>
          <NavLink to="/owner/all-products" className={linkClass}>
            <FaBox /> Products
          </NavLink>

          <button
            onClick={logout}
            className="bg-white text-amber-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default OwnerLayout;
