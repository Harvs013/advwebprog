const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
      index: true, // frequently searched by product name
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // reference to Category collection
      required: true,
      index: true, // frequently filtered by category
    },
    images: {
      type: [String], // array of image URLs/paths
      default: [],
    },
    imagePublicIds: {
      type: [String],
      default: [],
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    condition: {
      type: String,
      enum: ["new", "used"],
      default: "new",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to User collection
      required: true,
      index: true, // frequently searched by seller (e.g. "my listings")
    },
    status: {
      type: String,
      enum: ["available", "sold", "out of stock"],
      default: "available",
      index: true, // frequently filtered by status
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Compound index: common pattern is filtering by category + sorting/filtering by price
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model("Product", productSchema);