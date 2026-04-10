const express = require("express");

const { createUniversityAdmin, getUniversityAdmins } = require("../controllers/universityAdmin.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticate, authorizeRoles("system_admin"), createUniversityAdmin);
router.get("/", authenticate, authorizeRoles("system_admin"), getUniversityAdmins);

module.exports = router;
