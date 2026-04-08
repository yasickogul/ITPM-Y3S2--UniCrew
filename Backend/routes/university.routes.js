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

// POST → Add University
router.post("/", createUniversity);

// GET → Read all universities
router.get("/", getUniversities);

// GET → Read one university by ID
router.get("/:id", getUniversityById);

// PUT → Update university by ID
router.put("/:id", updateUniversity);

// DELETE → Remove university by ID
router.delete("/:id", deleteUniversity);

module.exports = router;