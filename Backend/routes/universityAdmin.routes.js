const express = require("express");

const { createUniversityAdmin, getUniversityAdmins } = require("../controllers/universityAdmin.controller");

const router = express.Router();

router.post("/", createUniversityAdmin);
router.get("/", getUniversityAdmins);

module.exports = router;
