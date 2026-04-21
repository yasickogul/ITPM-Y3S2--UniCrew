const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "unicrew_secret_key";

const normalizeRole = (roleValue = "") => {
  const role = String(roleValue).trim().toLowerCase().replace(/\s+/g, "_");
  if (role === "systemadmin") return "system_admin";
  if (role === "universityadmin" || role === "uni_admin") return "university_admin";
  return role;
};

const getToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

const mapUser = (decoded) => {
  const userId = decoded.id || decoded.userId;
  return {
    id: userId,
    userId,
    email: decoded.email,
    role: normalizeRole(decoded.role),
  };
};

const authenticate = (req, res, next) => {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = mapUser(decoded);
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const normalizedAllowed = roles.map((role) => normalizeRole(role));
    if (!normalizedAllowed.includes(normalizeRole(req.user.role))) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    return next();
  };
};

const authorizeRoles = (...roles) => authorize(...roles);

const optionalAuth = (req, _res, next) => {
  try {
    const token = getToken(req);
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = mapUser(decoded);
    }
  } catch (_error) {
    // ignore invalid optional auth token
  }
  next();
};

module.exports = { authenticate, authorize, authorizeRoles, optionalAuth };
