const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  getProfile,
  updateProfile,
  getAllUsers,
  changePassword,
} = require("../controllers/auth.controller");

const { authenticate, optionalAuth } = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", optionalAuth, getMe);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);
router.get("/users", authenticate, getAllUsers);

module.exports = router;
