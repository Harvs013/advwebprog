const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Verifies the Bearer token and attaches the logged-in user to req.user.
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user no longer exists" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
};

// Restricts a route to specific roles, e.g. authorize("admin").
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You don't have permission to do that" });
    }
    next();
  };
};

// Allows the resource owner OR an admin — e.g. GET /api/orders/user/:userId
// should only be readable by that buyer or by an admin.
exports.ownerOrAdmin = (paramName = "userId") => {
  return (req, res, next) => {
    const targetId = req.params[paramName];
    if (req.user.role === "admin" || req.user._id.toString() === targetId) {
      return next();
    }
    return res.status(403).json({ message: "You don't have permission to do that" });
  };
};