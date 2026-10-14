const Review = require("../models/reviewModel");

exports.createReview = async (req, res) => {
  try {
    const review = await Review.create({ ...req.body, user: req.user._id });
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin — every review, across all products (for moderation)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "firstName lastName email")
      .populate("product", "productName")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "firstName lastName profileImage")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReviewsByUser = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.params.userId }).populate(
      "product",
      "productName images"
    );
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const isOwner = review.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You don't have permission to edit this review" });
    }

    const { user, product, ...allowedUpdates } = req.body;
    Object.assign(review, allowedUpdates);
    await review.save();
    res.status(200).json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const isOwner = review.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You don't have permission to delete this review" });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};