const express = require("express");
const router = express.Router();

const {
  createCommunity,
  getCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getMyCommunities,
} = require("../controllers/community.controller");

const { authenticate } = require("../middleware/auth.middleware");

router.post("/", authenticate, createCommunity);
router.get("/", getCommunities);
router.get("/my", authenticate, getMyCommunities);
router.get("/:id", getCommunityById);
router.put("/:id", authenticate, updateCommunity);
router.delete("/:id", authenticate, deleteCommunity);
router.post("/:id/join", authenticate, joinCommunity);
router.post("/:id/leave", authenticate, leaveCommunity);

module.exports = router;
