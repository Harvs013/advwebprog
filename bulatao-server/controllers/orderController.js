const Order = require("../models/orderModel");

// Customer — creates an order for themselves.
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create({ ...req.body, user: req.user._id });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin — all orders, optional ?status= filter
exports.getOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;

    const orders = await Order.find(filter)
      .populate("user", "firstName lastName email")
      .populate("items.product", "productName price")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Owner or admin — a specific customer's orders ("Order Ongoing")
exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate("items.product", "productName price")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("items.product", "productName price");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — confirm order / mark ready for claiming / complete / cancel
exports.updateOrderStatus = async (req, res) => {
  try {
    const update = {};
    if (req.body.orderStatus) update.orderStatus = req.body.orderStatus;
    if (req.body.paymentStatus) update.paymentStatus = req.body.paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};