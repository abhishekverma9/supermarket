import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaClipboardList, FaTachometerAlt, FaSearch, FaTimes, FaComments, FaBars, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import FloatingChatbot from "../components/FloatingChatbot";
import { motion, AnimatePresence } from "framer-motion";

const ConsumerLayout = () => {
  const navigate = useNavigate();
  const { cart, products, setProducts, logout, isGuest, guestLogout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getTotalCartItems = (cart) => cart.reduce((total, item) => total + item.quantity, 0);

  const Logout = () => {
    if (isGuest) guestLogout();
    logout();
    navigate("/login");
  };

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
      isActive
        ? "bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-500 border border-[#FF8C00]/30"
        : "text-gray-300 hover:bg-white/5"
    }`;

  const cartCount = getTotalCartItems(cart);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-[#f0f0f5]">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => navigate("/consumer")}>
            <img src="/logooo.png" alt="Logo" className="w-10 h-10 object-contain rounded-full border border-[#FF8C00]/40" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-orange-500 leading-tight">Shop4Ever</h1>
                {isGuest && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#8A2BE2]/30 text-[#c084fc] border border-[#8A2BE2]/50 animate-pulse">
                    Guest
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 -mt-0.5">Consumer</p>
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
                  if (window.location.pathname !== "/consumer") navigate("/consumer");
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

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-2">
            <NavLink to="/consumer" end className={linkClass}>
              <FaTachometerAlt size={14} /> Shop
            </NavLink>
            <NavLink to="/consumer/orders" className={linkClass}>
              <FaClipboardList size={14} /> Orders
            </NavLink>
            <NavLink to="/consumer/cart" className={linkClass}>
              <div className="relative flex items-center gap-2">
                <FaShoppingCart size={14} /> Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-[#FF4B91] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
            </NavLink>
            <NavLink to="/consumer/profile" className={linkClass}>
              <FaUser size={14} /> Profile
            </NavLink>

            <button
              onClick={() => setChatbotOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-500/15 to-pink-500/15 text-orange-500 border border-[#FF8C00]/20 hover:border-[#FF8C00]/40 transition-all relative"
            >
              <FaComments size={14} /> Chat
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </button>

            <button
              onClick={Logout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
            >
              <FaSignOutAlt size={14} /> Logout
            </button>
          </div>

          {/* Mobile: Cart + Hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <NavLink to="/consumer/cart" className="relative p-2 text-gray-400 hover:text-orange-500 transition-colors">
              <FaShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF4B91] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </NavLink>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-400 hover:text-orange-500 transition-colors">
              {mobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 text-gray-100 border border-white/8 focus:border-[#FF8C00]/50 outline-none text-sm placeholder-gray-600"
              onFocus={() => {
                if (window.location.pathname !== "/consumer") navigate("/consumer");
              }}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-white/5 overflow-hidden"
            >
              <div className="flex flex-col gap-1 p-4">
                <NavLink to="/consumer" end className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  <FaTachometerAlt /> Shop
                </NavLink>
                <NavLink to="/consumer/orders" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  <FaClipboardList /> Orders
                </NavLink>
                <NavLink to="/consumer/cart" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  <FaShoppingCart /> Cart ({cartCount})
                </NavLink>
                <NavLink to="/consumer/profile" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  <FaUser /> Profile
                </NavLink>
                <button onClick={() => { setChatbotOpen(true); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 text-left">
                  <FaComments /> AI Chat Assistant
                </button>
                <div className="border-t border-white/5 mt-2 pt-2">
                  <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 w-full text-left">
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="text-center py-5 text-gray-600 text-xs border-t border-white/5">
        © {new Date().getFullYear()} Shop4Ever — Happy Shopping 🛍️
      </footer>

      {/* Floating Chatbot */}
      <FloatingChatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </div>
  );
};

export default ConsumerLayout;
