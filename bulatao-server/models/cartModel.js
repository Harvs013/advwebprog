const mongoose = require("mongoose");

// Embedded sub-document for each item inside the cart
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // reference to Product collection
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number, // price snapshot at the time it was added to cart
      required: true,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to User collection
      required: true,
      unique: true, // one active cart per user (unique also creates an index)
    },
    items: {
      type: [cartItemSchema], // embedded documents
      default: [],
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Cart", cartSchema);