const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const normalizeRole = (roleValue = "") => {
  const role = String(roleValue).trim().toLowerCase().replace(/\s+/g, "_");
  if (role === "system_admin" || role === "systemadmin") return "system_admin";
  if (role === "university_admin" || role === "uni_admin" || role === "universityadmin") return "university_admin";
  if (role === "student") return "student";
  return role;
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).populate("university", "name domain");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    let isPasswordValid = false;
    if (typeof user.password === "string" && user.password.startsWith("$2")) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Backward compatibility for legacy plain passwords in existing seed data.
      isPasswordValid = String(user.password) === String(password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const role = normalizeRole(user.role);
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.status(200).json({
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.fullName || user.name || "User",
          email: user.email,
          role,
          university: user.university?.name || null,
          universityId: user.university?._id?.toString() || null,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
