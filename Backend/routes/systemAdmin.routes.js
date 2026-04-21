const express = require("express");
const { getDashboardStats } = require("../controllers/systemDashboard.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/dashboard-stats", authenticate, authorizeRoles("system_admin"), getDashboardStats);

module.exports = router;
