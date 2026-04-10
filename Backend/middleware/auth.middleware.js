const jwt = require("jsonwebtoken");

const normalizeRole = (roleValue = "") => {
  const role = String(roleValue).trim().toLowerCase().replace(/\s+/g, "_");
  if (role === "systemadmin") return "system_admin";
  if (role === "universityadmin" || role === "uni_admin") return "university_admin";
  return role;
};

exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid authorization token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: normalizeRole(decoded.role),
    };
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

exports.authorizeRoles = (...allowedRoles) => (req, res, next) => {
  const normalizedAllowed = allowedRoles.map((role) => normalizeRole(role));
  if (!req.user || !normalizedAllowed.includes(normalizeRole(req.user.role))) {
    return res.status(403).json({ message: "Forbidden: insufficient permissions" });
  }
  return next();
};
