import jwt from "jsonwebtoken";

/**
 * Protect routes and restrict access based on user roles
 * @param  {...string} allowedRoles - roles allowed to access this route
 */
const authRole = (...allowedRoles) => {
  return (req, res, next) => {
    const token = req.headers.token; // token from header
    if (!token) {
      return res.json({ success: false, message: "Not authorized. Please login." });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.userId = decoded.id;
      req.userRole = decoded.role;
      if (!allowedRoles.includes(decoded.role)) {
        return res.json({ success: false, message: "Access denied." });
      }
      next();
    } catch (error) {
      console.error(error);
      return res.json({ success: false, message: "Invalid or expired token." });
    }
  };
};

export default authRole;
