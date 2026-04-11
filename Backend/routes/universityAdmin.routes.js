const express = require("express");

const {
  createUniversityAdmin,
  getUniversityAdmins,
  updateUniversityAdmin,
  deleteUniversityAdmin,
} = require("../controllers/universityAdmin.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticate, authorizeRoles("system_admin"), createUniversityAdmin);
router.get("/", authenticate, authorizeRoles("system_admin"), getUniversityAdmins);
router.put("/:id", authenticate, authorizeRoles("system_admin"), updateUniversityAdmin);
router.delete("/:id", authenticate, authorizeRoles("system_admin"), deleteUniversityAdmin);

module.exports = router;
