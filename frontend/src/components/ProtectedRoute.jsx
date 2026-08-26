import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaSpinner } from "react-icons/fa";

/**
 * ProtectedRoute
 * @param {Array<string>} roles - Allowed roles for this route
 */
const ProtectedRoute = ({ roles }) => {
  const { token, role, isLoadingAuth } = useContext(AuthContext);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <FaSpinner className="animate-spin text-orange-500 text-4xl" />
      </div>
    );
  }

  if (!token) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(role)) {
    // Role not allowed → redirect to login (or 403 page if you want)
    return <Navigate to="/login" replace />;
  }

  // Allowed → render children (Outlet means nested routes)
  return <Outlet />;
};

export default ProtectedRoute;
