// routes/university.routes.js

const express = require("express");
const router = express.Router();

const {
  createUniversity,
  getUniversities,
  getUniversityById,
  updateUniversity,
  deleteUniversity,
} = require("../controllers/university.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

// GET → Read all universities (public for dropdowns / listings)
router.get("/", getUniversities);

// POST → Add University (system admin only)
router.post("/", authenticate, authorizeRoles("system_admin"), createUniversity);

// GET → Read one university by ID
router.get("/:id", getUniversityById);

// PUT → Update university by ID (system admin only)
router.put("/:id", authenticate, authorizeRoles("system_admin"), updateUniversity);

// DELETE → Remove university by ID (system admin only)
router.delete("/:id", authenticate, authorizeRoles("system_admin"), deleteUniversity);

module.exports = router;