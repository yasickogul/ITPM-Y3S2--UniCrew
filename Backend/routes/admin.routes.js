const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/auth.middleware");
const User = require("../models/user.model");

router.use(authenticate);

router.get("/users", authorize("system_admin", "university_admin"), async (req, res) => {
  try {
    let query = { isActive: true };

    if (req.user.role === "university_admin") {
      const admin = await User.findById(req.user.id);
      if (admin.universityId) {
        query.universityId = admin.universityId;
      }
      query.role = "student";
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/stats", authorize("system_admin", "university_admin"), async (req, res) => {
  try {
    let query = { isActive: true };

    if (req.user.role === "university_admin") {
      const admin = await User.findById(req.user.id);
      if (admin.universityId) {
        query.universityId = admin.universityId;
      }
    }

    const totalUsers = await User.countDocuments(query);
    const students = await User.countDocuments({ ...query, role: "student" });
    const admins = await User.countDocuments({ ...query, role: "university_admin" });

    res.status(200).json({
      message: "Stats fetched successfully",
      data: {
        totalUsers,
        students,
        admins,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.put("/users/:id/deactivate", authorize("system_admin", "university_admin"), async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role === "university_admin" && req.user.id === id) {
      return res.status(403).json({
        message: "Cannot deactivate your own account",
      });
    }

    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User deactivated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.put("/users/:id/activate", authorize("system_admin"), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, { isActive: true }, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User activated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.put("/users/:id/role", authorize("system_admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["student", "university_admin", "system_admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
