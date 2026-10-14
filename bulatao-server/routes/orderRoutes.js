const express = require("express");
const router = express.Router();
const { protect, authorize, ownerOrAdmin } = require("../middleware/authMiddleware");
const { paramIdValidation, orderBodyValidation, orderStatusValidation } = require("../middleware/validationMiddleware");
const { orderWriteLimiter } = require("../middleware/rateLimiterMiddleware");
const {
  createOrder,
  getOrders,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

router.post("/", orderWriteLimiter, protect, orderBodyValidation, createOrder);
router.get("/", protect, authorize("admin"), getOrders);
router.get("/user/:userId", protect, paramIdValidation("userId"), ownerOrAdmin("userId"), getOrdersByUser);
router.get("/:id", protect, paramIdValidation("id"), getOrderById);
router.put("/:id/status", orderWriteLimiter, protect, paramIdValidation("id"), authorize("admin"), orderStatusValidation, updateOrderStatus);
router.delete("/:id", orderWriteLimiter, protect, paramIdValidation("id"), authorize("admin"), deleteOrder);

module.exports = router;
