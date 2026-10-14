const Cart = require("../models/cartModel");

exports.getCartByUser = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.params.userId }).populate(
      "items.product",
      "productName price images"
    );
    if (!cart) {
      cart = await Cart.create({ user: req.params.userId, items: [], totalPrice: 0 });
    }
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.user._id; // trust the logged-in user, not the request body
    const { productId, quantity, price } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [], totalPrice: 0 });
    }

    const existingItem = cart.items.find((i) => i.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price });
    }

    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.removeItemFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.params.userId },
      { items: [], totalPrice: 0 },
      { new: true }
    );
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};