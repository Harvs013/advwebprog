const express = require("express");
const router = express.Router();
const { protect, ownerOrAdmin } = require("../middleware/authMiddleware");
const { paramIdValidation, cartItemValidation } = require("../middleware/validationMiddleware");
const { cartWriteLimiter } = require("../middleware/rateLimiterMiddleware");
const {
  getCartByUser,
  addItemToCart,
  removeItemFromCart,
  clearCart,
} = require("../controllers/cartController");

router.get("/:userId", protect, paramIdValidation("userId"), ownerOrAdmin("userId"), getCartByUser);
router.post("/add", cartWriteLimiter, protect, cartItemValidation, addItemToCart); // controller uses req.user, not the body, for the owner
router.delete("/:userId/item/:productId", cartWriteLimiter, protect, paramIdValidation("userId"), paramIdValidation("productId"), ownerOrAdmin("userId"), removeItemFromCart);
router.delete("/:userId/clear", cartWriteLimiter, protect, paramIdValidation("userId"), ownerOrAdmin("userId"), clearCart);

module.exports = router;
