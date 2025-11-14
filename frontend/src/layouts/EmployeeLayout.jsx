import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaBox,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";

const EmployeeLayout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Dynamic link styles
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-[#FF8C00] to-[#FF4B91] text-yellow-500 border border-yellow-400 shadow-md font-semibold"
        : "text-[#F5F5F5] hover:text-[#FF8C00] hover:bg-[#2E2E2E]"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-[#F5F5F5]">
      {/* Top Navbar */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-[#2E2E2E] to-[#1C1C1C] shadow-lg border-b border-[#FF8C00]/40"
      >
        {/* Logo + Title */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/employee")}
        >
          <img
            src="/logooo.png"
            alt="Shop4Ever Logo"
            className="w-12 h-12 object-contain rounded-full border border-[#FF8C00]/60 shadow-lg"
          />
          <div>
           <h1 className="text-2xl font-extrabold text-[#FF8C00]">
    Shop4Ever
  </h1>
            <p className="text-sm text-gray-400 -mt-1">Employee Panel</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <NavLink to="/employee" end className={linkClass}>
            <FaTachometerAlt /> Dashboard
          </NavLink>
          <NavLink to="/employee/total-orders" className={linkClass}>
            <FaClipboardList /> Orders
          </NavLink>
          <NavLink to="/employee/products" className={linkClass}>
            <FaBox /> Add Products
          </NavLink>
          <NavLink to="/employee/profile" className={linkClass}>
            <FaUser /> Profile
          </NavLink>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="flex items-center gap-2 bg-[#FF8C00] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#ffa733] shadow-md transition-all"
          >
            <FaSignOutAlt /> Logout
          </motion.button>
        </div>
      </motion.nav>

      {/* Main Dashboard Content */}
      <main className="flex-1 p-8 bg-[#121212]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-[#2E2E2E]/60 border border-[#FF8C00]/20 rounded-2xl p-6 shadow-xl backdrop-blur-sm"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-sm border-t border-[#2E2E2E]">
        © {new Date().getFullYear()} Shop4Ever — Empowering Employees Everywhere 💼
      </footer>
    </div>
  );
};

export default EmployeeLayout;
