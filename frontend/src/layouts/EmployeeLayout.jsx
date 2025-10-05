import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaClipboardList, FaBox, FaUser } from "react-icons/fa";

const EmployeeLayout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Active link style
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-l-lg ${
      isActive
        ? "bg-blue-700 font-semibold border-l-4 border-yellow-400"
        : "hover:bg-blue-500"
    } text-white`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => navigate("/employee")}
        >
          <img src="/logooo.png" alt="Logo" className="w-12 h-12 object-contain" />
          <h1 className="text-xl font-bold">Employee Panel</h1>
        </div>

        <div className="flex gap-4 items-center">
          <NavLink to="/employee" end className={linkClass}>
            <FaTachometerAlt /> Dashboard
          </NavLink>
          <NavLink to="/employee/total-orders" className={linkClass}>
            <FaClipboardList /> Orders
          </NavLink>
          <NavLink to="/employee/products" className={linkClass}>
            <FaBox />Add Products
          </NavLink>
          <NavLink to="/employee/profile" className={linkClass}>
            <FaUser /> Profile
          </NavLink>

          <button
            onClick={logout}
            className="bg-white text-blue-600 px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout;
