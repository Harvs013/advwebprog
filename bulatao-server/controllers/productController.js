const mongoose = require("mongoose");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const cloudinary = require("../config/cloudinary");

const ALLOWED_SORT_FIELDS = ["price", "productName", "quantity", "createdAt"];

const uploadImageToCloudinary = (buffer) => new Promise((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: "bulldogs-exchange/products" },
    (error, uploadedFile) => {
      if (error) reject(error);
      else resolve(uploadedFile);
    }
  );

  uploadStream.end(buffer);
});

const removeCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Could not remove Cloudinary image ${publicId}: ${error.message}`);
  }
};

exports.uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded." });
    }

    const result = await uploadImageToCloudinary(req.file.buffer);

    res.status(200).json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin or seller. A seller's listing is always attributed to themselves;
// an admin may specify any seller or default to themselves.
exports.createProduct = async (req, res) => {
  let uploadedImage;
  try {
    const seller = req.user.role === "admin" ? req.body.seller || req.user._id : req.user._id;
    const productData = { ...req.body, seller };
    delete productData.imagePublicIds;

    if (req.file) {
      uploadedImage = await uploadImageToCloudinary(req.file.buffer);
      productData.images = [uploadedImage.secure_url];
      productData.imagePublicIds = [uploadedImage.public_id];
    }

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (err) {
    if (uploadedImage) await removeCloudinaryImage(uploadedImage.public_id);
    res.status(400).json({ message: err.message });
  }
};

// Public — supports:
//   ?category=  (a category name like "Uniform", OR a category ObjectId)
//   ?status=
//   ?search=    (matches productName)
//   ?seller=
//   ?sort=      (a field name for ascending order, e.g. "price";
//                prefix with "-" for descending, e.g. "-price")
//   ?page= & ?limit=  (pagination, defaults: page=1, limit=10)
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

    if (req.query.status) filter.status = req.query.status;
    if (req.query.seller) {
      filter.seller = req.query.seller;
    }
    if (req.query.search) {
      filter.productName = { $regex: req.query.search, $options: "i" };
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
      products,
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit) || 1,
      sort: sortOption,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "categoryName")
      .populate("seller", "firstName lastName email");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin can edit any product; a seller can only edit their own.
exports.updateProduct = async (req, res) => {
  let uploadedImage;
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Product not found" });

    if (req.user.role !== "admin" && existing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own products" });
    }

    const updates = { ...req.body };
    if (req.user.role !== "admin") delete updates.seller;
    delete updates.imagePublicIds;

    if (req.file) {
      uploadedImage = await uploadImageToCloudinary(req.file.buffer);
      updates.images = [uploadedImage.secure_url];
      updates.imagePublicIds = [uploadedImage.public_id];
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      if (uploadedImage) await removeCloudinaryImage(uploadedImage.public_id);
      return res.status(404).json({ message: "Product not found" });
    }

    if (uploadedImage) {
      await Promise.all((existing.imagePublicIds || []).map(removeCloudinaryImage));
    }
    res.status(200).json(product);
  } catch (err) {
    if (uploadedImage) await removeCloudinaryImage(uploadedImage.public_id);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Product not found" });

    if (req.user.role !== "admin" && existing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own products" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};