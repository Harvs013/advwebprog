const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { paramIdValidation, reviewBodyValidation, reviewUpdateValidation } = require("../middleware/validationMiddleware");
const { reviewWriteLimiter } = require("../middleware/rateLimiterMiddleware");
const {
  createReview,
  getAllReviews,
  getReviewsByProduct,
  getReviewsByUser,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

router.post("/", reviewWriteLimiter, protect, reviewBodyValidation, createReview);
router.get("/", protect, authorize("admin"), getAllReviews);
router.get("/product/:productId", paramIdValidation("productId"), getReviewsByProduct); // public
router.get("/user/:userId", protect, paramIdValidation("userId"), getReviewsByUser);
router.put("/:id", reviewWriteLimiter, protect, paramIdValidation("id"), reviewUpdateValidation, updateReview);
router.delete("/:id", reviewWriteLimiter, protect, paramIdValidation("id"), deleteReview);

module.exports = router;
