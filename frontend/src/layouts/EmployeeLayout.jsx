import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaTachometerAlt, FaClipboardList, FaBox, FaUser, FaSignOutAlt, FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const EmployeeLayout = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const { logout } = useContext(AuthContext);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        localStorage.setItem("searchQuery", searchQuery);
        window.dispatchEvent(new CustomEvent("searchQueryChanged", { detail: searchQuery }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-500 border border-[#FF8C00]/30"
        : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
      isActive ? "bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-500 border border-[#FF8C00]/30" : "text-gray-300 hover:bg-white/5"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-[#f0f0f5]">
      <nav className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/employee")}>
            <img src="/logooo.png" alt="Shop4Ever Logo" className="w-10 h-10 object-contain rounded-full border border-[#FF8C00]/40" />
            <div>
              <h1 className="text-lg font-extrabold text-orange-500 leading-tight">Shop4Ever</h1>
              <p className="text-[11px] text-gray-500 -mt-0.5">Employee Panel</p>
            </div>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" size={14} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-white/5 text-gray-100 border border-white/8 focus:border-[#FF8C00]/50 focus:ring-2 focus:ring-[#FF8C00]/20 outline-none transition-all text-sm placeholder-gray-600"
                onFocus={() => {
                  if (window.location.pathname !== "/employee") navigate("/employee");
                }}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-500 hover:text-orange-500 transition-colors"
                  >
                    <FaTimes size={12} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/employee" end className={linkClass}><FaTachometerAlt size={14} /> Dashboard</NavLink>
            <NavLink to="/employee/total-orders" className={linkClass}><FaClipboardList size={14} /> Orders</NavLink>
            <NavLink to="/employee/products" className={linkClass}><FaBox size={14} /> Add Products</NavLink>
            <NavLink to="/employee/profile" className={linkClass}><FaUser size={14} /> Profile</NavLink>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 transition-opacity">
              <FaSignOutAlt size={14} /> Logout
            </button>
          </div>

          <button className="md:hidden p-2 text-gray-400 hover:text-orange-500" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-white/5 overflow-hidden">
              <div className="flex flex-col gap-1 p-4">
                <NavLink to="/employee" end className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}><FaTachometerAlt /> Dashboard</NavLink>
                <NavLink to="/employee/total-orders" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}><FaClipboardList /> Orders</NavLink>
                <NavLink to="/employee/products" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}><FaBox /> Add Products</NavLink>
                <NavLink to="/employee/profile" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}><FaUser /> Profile</NavLink>
                <div className="border-t border-white/5 mt-2 pt-2">
                  <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 w-full text-left"><FaSignOutAlt /> Logout</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="text-center py-5 text-gray-600 text-xs border-t border-white/5">
        © {new Date().getFullYear()} Shop4Ever — Empowering Employees Everywhere 💼
      </footer>
    </div>
  );
};

export default EmployeeLayout;
