import { Navigate, Outlet } from "react-router-dom";

/**
 * ProtectedRoute
 * @param {Array<string>} roles - Allowed roles for this route
 */
const ProtectedRoute = ({ roles }) => {
  // Get auth data from localStorage (mock)
  const auth = localStorage.getItem("token")
  const role = localStorage.getItem("role")

  if (!auth) {
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
