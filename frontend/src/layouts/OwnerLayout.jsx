import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaClipboardList, FaBox } from "react-icons/fa";

const OwnerLayout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Active link styling aligned with employee theme
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-[#FF8C00] to-[#FF4B91] text-[#FF8C00] shadow-md font-semibold border border-[#FF8C00]/40"
        : "text-[#F5F5F5] hover:text-[#FF8C00] hover:bg-[#2E2E2E]"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-[#F5F5F5]">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-[#2E2E2E] to-[#1C1C1C] shadow-lg border-b border-[#FF8C00]/40">
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => navigate("/owner")}
        >
          <img src="/logooo.png" alt="Logo" className="w-12 h-12 object-contain rounded-full border border-[#FF8C00]/60 shadow-lg" />
          <div>
            <h1 className="text-2xl font-extrabold text-[#FF8C00]">Shop4Ever</h1>
            <p className="text-sm text-gray-400 -mt-1">Owner Panel</p>
          </div>
        </div>

        <div className="flex gap-4 items-center text-sm font-medium">
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
            className="flex items-center gap-2 bg-[#FF8C00] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#ffa733] shadow-md transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-[#121212]">
        <div className="bg-[#2E2E2E]/60 border border-[#FF8C00]/20 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-sm border-t border-[#2E2E2E]">
        © {new Date().getFullYear()} Shop4Ever — Manage with Insight 📊
      </footer>
    </div>
  );
};

export default OwnerLayout;
