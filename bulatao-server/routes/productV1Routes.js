const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { paramIdValidation, productBodyValidation, productUpdateValidation, productQueryValidation } = require("../middleware/validationMiddleware");
const { catalogWriteLimiter } = require("../middleware/rateLimiterMiddleware");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productV1Controller");

router.get("/", productQueryValidation, getProducts);
router.get("/:id", paramIdValidation("id"), getProductById);

router.post("/", catalogWriteLimiter, protect, authorize("admin", "seller"), productBodyValidation, createProduct);
router.put("/:id", catalogWriteLimiter, protect, paramIdValidation("id"), authorize("admin", "seller"), productUpdateValidation, updateProduct);
router.delete("/:id", catalogWriteLimiter, protect, paramIdValidation("id"), authorize("admin", "seller"), deleteProduct);

module.exports = router;
