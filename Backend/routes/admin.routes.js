const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/auth.middleware");
const User = require("../models/user.model");
const Community = require("../models/community.model");
const Discussion = require("../models/discussion.model");

router.use(authenticate);

const getScopedCommunityIds = async (req) => {
  if (req.user.role === "system_admin") {
    return null;
  }

  const admin = await User.findById(req.user.id).select("universityId").lean();
  const universityId = req.user.universityId || admin?.universityId;

  if (!universityId) {
    return [];
  }

  const communities = await Community.find({ universityId }).select("_id").lean();
  return communities.map((community) => String(community._id));
};

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

router.get("/posts/pending", authorize("system_admin", "university_admin"), async (req, res) => {
  try {
    const scopedCommunityIds = await getScopedCommunityIds(req);
    const query = {
      status: { $in: ["Flagged", "Open"] },
    };

    if (Array.isArray(scopedCommunityIds)) {
      query.communityId = { $in: scopedCommunityIds };
    }

    const posts = await Discussion.find(query).sort({ createdAt: -1 }).limit(100);

    res.status(200).json({
      message: "Pending posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/posts/reported", authorize("system_admin", "university_admin"), async (req, res) => {
  try {
    const scopedCommunityIds = await getScopedCommunityIds(req);
    const query = {
      $or: [{ status: "Flagged" }, { "aiAnalysis.isFlagged": true }],
    };

    if (Array.isArray(scopedCommunityIds)) {
      query.communityId = { $in: scopedCommunityIds };
    }

    const posts = await Discussion.find(query).sort({ createdAt: -1 }).limit(100);

    res.status(200).json({
      message: "Reported posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.put("/posts/:id/approve", authorize("system_admin", "university_admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const scopedCommunityIds = await getScopedCommunityIds(req);

    const post = await Discussion.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (Array.isArray(scopedCommunityIds) && !scopedCommunityIds.includes(String(post.communityId))) {
      return res.status(403).json({ message: "You can only moderate posts in your university" });
    }

    post.status = "Open";
    if (post.aiAnalysis) {
      post.aiAnalysis.isFlagged = false;
      post.aiAnalysis.flagReasons = [];
    }
    await post.save();

    return res.status(200).json({
      message: "Post approved successfully",
      data: post,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/posts/:id/reject", authorize("system_admin", "university_admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const scopedCommunityIds = await getScopedCommunityIds(req);

    const post = await Discussion.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (Array.isArray(scopedCommunityIds) && !scopedCommunityIds.includes(String(post.communityId))) {
      return res.status(403).json({ message: "You can only moderate posts in your university" });
    }

    post.status = "Closed";
    await post.save();

    return res.status(200).json({
      message: "Post rejected successfully",
      data: post,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/posts/:id/dismiss-report", authorize("system_admin", "university_admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const scopedCommunityIds = await getScopedCommunityIds(req);

    const post = await Discussion.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (Array.isArray(scopedCommunityIds) && !scopedCommunityIds.includes(String(post.communityId))) {
      return res.status(403).json({ message: "You can only moderate posts in your university" });
    }

    post.status = "Open";
    if (post.aiAnalysis) {
      post.aiAnalysis.isFlagged = false;
      post.aiAnalysis.flagReasons = [];
    }
    await post.save();

    return res.status(200).json({
      message: "Report dismissed successfully",
      data: post,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
