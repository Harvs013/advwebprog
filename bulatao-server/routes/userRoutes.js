const express = require("express");
const router = express.Router();
const { protect, authorize, ownerOrAdmin } = require("../middleware/authMiddleware");
const {
  registerValidation,
  loginValidation,
  profileUpdateValidation,
  passwordChangeValidation,
  userStatusValidation,
  userIdValidation,
} = require("../middleware/validationMiddleware");
const {
  loginLimiter,
  registerLimiter,
  passwordChangeLimiter,
} = require("../middleware/rateLimiterMiddleware");
const {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  changePassword,
  setUserStatus,
  deleteUser,
} = require("../controllers/userController");

// Public
router.post("/", registerLimiter, registerValidation, createUser); // registration is rate-limited and validated
router.post("/login", loginLimiter, loginValidation, loginUser);

// Admin only
router.get("/", protect, authorize("admin"), getUsers);
router.put("/:id/status", protect, authorize("admin"), userIdValidation, userStatusValidation, setUserStatus);
router.delete("/:id", protect, authorize("admin"), userIdValidation, deleteUser);

// Owner or admin
router.get("/:id", protect, userIdValidation, ownerOrAdmin("id"), getUserById);
router.put("/:id", protect, userIdValidation, ownerOrAdmin("id"), profileUpdateValidation, updateUser);
router.put(
  "/:id/password",
  passwordChangeLimiter,
  protect,
  userIdValidation,
  ownerOrAdmin("id"),
  passwordChangeValidation,
  changePassword
);

module.exports = router;
