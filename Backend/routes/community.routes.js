const express = require("express");
const router = express.Router();

const {
  createCommunity,
  getCommunities,
  getAllCommunitiesForAdmin,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getMyCommunities,
} = require("../controllers/community.controller");

const { authenticate } = require("../middleware/auth.middleware");

router.post("/", authenticate, createCommunity);
router.get("/admin/all", authenticate, getAllCommunitiesForAdmin);
router.get("/", authenticate, getCommunities);
router.get("/my", authenticate, getMyCommunities);
router.get("/:id", getCommunityById);
router.put("/:id", authenticate, updateCommunity);
router.delete("/:id", authenticate, deleteCommunity);
router.post("/:id/join", authenticate, joinCommunity);
router.post("/:id/leave", authenticate, leaveCommunity);

module.exports = router;
