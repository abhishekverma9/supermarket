import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaClipboardList, FaTachometerAlt, FaSearch, FaTimes, FaComments } from "react-icons/fa";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import FloatingChatbot from "../components/FloatingChatbot";
import { motion, AnimatePresence } from "framer-motion";

const ConsumerLayout = () => {
  const navigate = useNavigate();
  const { cart, products, setProducts } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const getTotalCartItems = (cart) => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Store search query in localStorage so Dashboard can access it
  useEffect(() => {
    if (searchQuery !== undefined) {
      localStorage.setItem("searchQuery", searchQuery);
    }
  }, [searchQuery]);

  // Active link style aligned with employee theme
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-[#FF8C00] to-[#FF4B91] text-black shadow-md font-semibold"
        : "text-[#F5F5F5] hover:text-[#FF8C00] hover:bg-[#2E2E2E]"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-[#F5F5F5]">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-[#2E2E2E] to-[#1C1C1C] shadow-lg border-b border-[#FF8C00]/40">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/consumer")}>
          <img src="/logooo.png" alt="Logo" className="w-12 h-12 object-contain rounded-full border border-[#FF8C00]/60 shadow-lg" />
          <div>
            <h1 className="text-2xl font-extrabold text-[#FF8C00]">Shop4Ever</h1>
            <p className="text-sm text-gray-400 -mt-1">Consumer Panel</p>
          </div>
        </div>

        {/* Search Bar - Enhanced */}
        <div className="flex-1 max-w-lg mx-8 relative">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative group">
              {/* Search Icon with Animation */}
              <motion.div
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
                animate={{ rotate: searchQuery ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <FaSearch className="text-[#FF8C00] group-hover:text-[#ffa733] transition-colors" size={20} />
              </motion.div>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => {
                  const query = e.target.value;
                  setSearchQuery(query);
                  localStorage.setItem("searchQuery", query);
                  window.dispatchEvent(new CustomEvent("searchQueryChanged", { detail: query }));
                }}
                className="w-full pl-14 pr-12 py-3 rounded-xl bg-[#1e1e1e] text-gray-100 border-2 border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-4 focus:ring-[#FF8C00]/20 outline-none transition-all duration-300 placeholder-gray-500 hover:border-[#FF8C00]/50 shadow-lg hover:shadow-[#FF8C00]/10 backdrop-blur-sm"
                onFocus={() => {
                  if (window.location.pathname !== "/consumer") {
                    navigate("/consumer");
                  }
                }}
              />

              {/* Clear Button with Animation */}
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={() => {
                      setSearchQuery("");
                      localStorage.setItem("searchQuery", "");
                      window.dispatchEvent(new CustomEvent("searchQueryChanged", { detail: "" }));
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-[#FF8C00]/20 hover:bg-[#FF8C00]/30 text-[#FF8C00] hover:text-[#ffa733] transition-all duration-200 flex items-center justify-center group"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTimes size={14} className="group-hover:scale-110 transition-transform" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Glowing Effect on Focus */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF8C00]/10 via-[#FF4B91]/10 to-[#FF8C00]/10 opacity-0 pointer-events-none"
                animate={{
                  opacity: searchQuery ? 0.5 : 0,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <NavLink to="/consumer" end className={linkClass}>
            <FaTachometerAlt /> Dashboard
          </NavLink>

          <NavLink to="/consumer/orders" className={linkClass}>
            <FaClipboardList /> Orders
          </NavLink>

          <NavLink to="/consumer/cart" className={linkClass}>
            <div className="flex items-center justify-center relative gap-1">
              <FaShoppingCart /> Cart
              <span className="absolute -top-2 -right-4 bg-[#FF4B91] w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                {getTotalCartItems(cart)}
              </span>
            </div>
          </NavLink>

          <button
            onClick={() => setChatbotOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#FF8C00] to-[#FF4B91] hover:from-[#ffa733] hover:to-[#FF6BA3] text-black shadow-md transition-all relative group"
            title="Open Chatbot"
          >
            <FaComments />
            <span>Chat</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black animate-pulse"></span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-[#FF8C00] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#ffa733] shadow-md transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 p-8 bg-[#121212]">
        <div className="bg-[#2E2E2E]/60 border border-[#FF8C00]/20 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-sm border-t border-[#2E2E2E]">
        © {new Date().getFullYear()} Shop4Ever — Happy Shopping 🛍️
      </footer>

      {/* Floating Chatbot */}
      <FloatingChatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </div>
  );
};

export default ConsumerLayout;
