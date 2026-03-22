// routes/university.routes.js

const express = require("express");
const router = express.Router();

const {
  createUniversity,
} = require("../controllers/university.controller");

// POST → Add University
router.post("/", createUniversity);

module.exports = router;