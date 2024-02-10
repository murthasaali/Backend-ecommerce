// cartController.js
const User = require('../models/user');
const Product = require('../models/productModel');
const { json } = require('body-parser');

exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.query.userId; // Retrieve userId from query parameters
    console.log("id of product",productId)
    const product = await Product.findById(productId);
    const user = await User.findById(userId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingCartItem = user.cart.find(item => item.productId.toString() === productId);
    if (existingCartItem) {
      return res.status(200).json({ message: "Product already in cart" });
    } else {
      user.cart.push({ productId: product._id });
    }

    await user.save();
    return res.status(200).json({ message: 'Product added to cart successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// Remove a product from the user's cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const {userid} = req.body; 
    const user = await User.findById(userid);
    // User object attached by authentication middleware
    user.cart = user.cart.filter(item => item.productId.toString() !== productId);
    await user.save();
    res.status(200).json({ message: 'Product removed from cart successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get the user's cart items
exports.getCart = async (req, res) => {
  try {
    const { userid } = req.body;
    const user = await User.findById(userid).populate('cart.productId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.cart.length === 0) {
      return res.status(200).json({ message: 'Cart is empty' });
    }

    res.status(200).json(user.cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

