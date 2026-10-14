const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { paramIdValidation, categoryBodyValidation } = require("../middleware/validationMiddleware");
const { catalogWriteLimiter } = require("../middleware/rateLimiterMiddleware");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.get("/", getCategories);        // public — feeds the "search by category" filter
router.get("/:id", paramIdValidation("id"), getCategoryById);   // public

router.post("/", catalogWriteLimiter, protect, authorize("admin"), categoryBodyValidation, createCategory);
router.put("/:id", catalogWriteLimiter, protect, paramIdValidation("id"), authorize("admin"), categoryBodyValidation, updateCategory);
router.delete("/:id", catalogWriteLimiter, protect, paramIdValidation("id"), authorize("admin"), deleteCategory);

module.exports = router;
