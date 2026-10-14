const mongoose = require("mongoose");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");

const ALLOWED_SORT_FIELDS = ["price", "productName", "quantity", "createdAt"];

exports.createProduct = async (req, res) => {
  try {
    const seller = req.user.role === "admin" ? req.body.seller || req.user._id : req.user._id;
    const product = await Product.create({ ...req.body, seller });
    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Supports:
//   ?category=   (a category name, e.g. "Uniform", OR a category ObjectId)
//   ?supplier=   (a seller's first/last name, e.g. "Nike", OR a seller ObjectId)
//   ?status=
//   ?search=     (keyword match against productName AND description)
//   ?sort=       (e.g. "price" ascending, "-price" descending)
//   ?page= & ?limit=
exports.getProducts = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        filter.category = req.query.category;
      } else {
        const matchedCategory = await Category.findOne({
          categoryName: { $regex: `^${req.query.category}$`, $options: "i" },
        });
        filter.category = matchedCategory ? matchedCategory._id : null;
      }
    }

    const supplierQuery = req.query.supplier || req.query.seller;
    if (supplierQuery) {
      if (mongoose.Types.ObjectId.isValid(supplierQuery)) {
        filter.seller = supplierQuery;
      } else {
        const matchedSeller = await User.findOne({
          $or: [
            { firstName: { $regex: `^${supplierQuery}$`, $options: "i" } },
            { lastName: { $regex: `^${supplierQuery}$`, $options: "i" } },
          ],
        });
        filter.seller = matchedSeller ? matchedSeller._id : null;
      }
    }

    if (req.query.status) filter.status = req.query.status;

    if (req.query.search) {
      filter.$or = [
        { productName: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (req.query.sort) {
      const isDescending = req.query.sort.startsWith("-");
      const sortField = isDescending ? req.query.sort.slice(1) : req.query.sort;
      if (ALLOWED_SORT_FIELDS.includes(sortField)) {
        sortOption = { [sortField]: isDescending ? -1 : 1 };
      }
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate("category", "categoryName")
        .populate("seller", "firstName lastName email")
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      count: products.length,
      totalCount: totalProducts,
      page,
      limit,
      totalPages: Math.ceil(totalProducts / limit) || 1,
      data: products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "categoryName")
      .populate("seller", "firstName lastName email");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    res.status(200).json({
      success: true,
      message: "Product retrieved successfully.",
      data: product,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    if (req.user.role !== "admin" && existing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only edit your own products." });
    }

    const updates = { ...req.body };
    if (req.user.role !== "admin") delete updates.seller;

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    if (req.user.role !== "admin" && existing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only delete your own products." });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
      data: null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};