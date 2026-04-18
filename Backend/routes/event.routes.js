const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getPendingEvents,
  approveEvent,
  declineEvent,
} = require("../controllers/event.controller");

const { authenticate, authorize } = require("../middleware/auth.middleware");

// Public routes
router.get("/", getEvents);
router.get("/upcoming", getUpcomingEvents);

// Admin routes (must come before /:id to avoid conflict)
router.get("/admin/pending", authenticate, authorize("university_admin"), getPendingEvents);

// Protected routes - requires authentication
router.post("/", authenticate, createEvent);
router.get("/:id", getEventById);
router.put("/:id", authenticate, updateEvent);
router.delete("/:id", authenticate, deleteEvent);
router.put("/:id/approve", authenticate, authorize("university_admin"), approveEvent);
router.put("/:id/decline", authenticate, authorize("university_admin"), declineEvent);

module.exports = router;
