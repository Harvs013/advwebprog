const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const authentication = require("../middleware/authentication");
const authorize = require("../middleware/authorization");
const {
  registerValidation,
  loginValidation,
  profileUpdateValidation,
  userIdValidation,
} = require("../middleware/validationMiddleware");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiterMiddleware");

router.get("/user", authentication, authorize("admin"), UserController.getUsers);
router.get("/:id", authentication, userIdValidation, authorize("admin"), UserController.getUserById);
router.post("/login", loginLimiter, loginValidation, UserController.loginUser);
router.post("/register", registerLimiter, registerValidation, UserController.createUser);
router.patch(
  "/update/:id",
  authentication,
  userIdValidation,
  profileUpdateValidation,
  authorize("admin"),
  UserController.updateUser
);
router.delete("/remove/:id", authentication, userIdValidation, authorize("admin"), UserController.deleteUser);

module.exports = router;
