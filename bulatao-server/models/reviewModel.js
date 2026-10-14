const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // reference to Product collection
      required: true,
      index: true, // frequently searched: "get all reviews for this product"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to User collection
      required: true,
      index: true, // frequently searched: "get all reviews by this user"
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt (updatedAt not required per Part 2 fields)
  }
);

module.exports = mongoose.model("Review", reviewSchema);