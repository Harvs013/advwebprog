const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const uploadImageMiddleware = require("../middleware/uploadImageMiddleware");
const { paramIdValidation, productBodyValidation, productUpdateValidation, productQueryValidation } = require("../middleware/validationMiddleware");
const { catalogWriteLimiter } = require("../middleware/rateLimiterMiddleware");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} = require("../controllers/productController");

router.get("/", productQueryValidation, getProducts);
router.get("/:id", paramIdValidation("id"), getProductById); // public
router.post("/upload", catalogWriteLimiter, protect, authorize("admin", "seller"), uploadImageMiddleware.single("image"), uploadProductImage);

router.post("/", catalogWriteLimiter, protect, authorize("admin", "seller"), uploadImageMiddleware.single("image"), productBodyValidation, createProduct);
router.put("/:id", catalogWriteLimiter, protect, paramIdValidation("id"), authorize("admin", "seller"), uploadImageMiddleware.single("image"), productUpdateValidation, updateProduct);
router.delete("/:id", catalogWriteLimiter, protect, paramIdValidation("id"), authorize("admin", "seller"), deleteProduct);

module.exports = router;
