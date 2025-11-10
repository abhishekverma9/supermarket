import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaClipboardList, FaTachometerAlt } from "react-icons/fa";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ConsumerLayout = () => {
  const navigate = useNavigate();
  const { cart } = useContext(AuthContext)

  const getTotalCartItems = (cart) => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Active link style
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive ? "bg-emerald-700/80 font-semibold ring-2 ring-emerald-300/60" : "hover:bg-emerald-500/70"
    } text-white`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        {/* Logo */}
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => navigate("/consumer")}
        >
          <img src="/logooo.png" alt="Logo" className="w-12 h-12 object-contain" />
          <h1 className="text-xl font-bold drop-shadow-sm">Consumer Panel</h1>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <NavLink to="/consumer" end className={linkClass}>
            <FaTachometerAlt /> Dashboard
          </NavLink>

          <NavLink to="/consumer/orders" className={linkClass}>
            <FaClipboardList /> Orders
          </NavLink>

          <NavLink to="/consumer/cart" className={linkClass}>
            <div className="flex items-center justify-center relative gap-1">
              <FaShoppingCart /> Cart
              <span className="absolute -top-2 -right-4 bg-red-500 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                {getTotalCartItems(cart)}
              </span>
            </div>
          </NavLink>

          <button
            onClick={logout}
            className="bg-white text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ConsumerLayout;
