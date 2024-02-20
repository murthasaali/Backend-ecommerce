// cartController.js
const User = require('../models/user');
const Product = require('../models/productModel');
const { json } = require('body-parser');

exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const {userId} = req.query // Retrieve userId from query parameters
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
    const { userId } = req.query; // No need for req.query.userId, just req.query
    let user = await User.findById(userId);
  
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    // Filter out the item with the given productId from the user's cart
    user.cart = user.cart.filter(item => item.productId.toString() !== productId);
  
    // Save the updated user object
    await user.save();
  
    res.status(200).json({ message: 'Product removed from cart successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}  

// Get the user's cart items
exports.getCart = async (req, res) => {
  try {
    const {userId} = req.query; 
    console.log(userId)// Retrieve userId from query parameters
    const user = await User.findById(userId).populate('cart.productId');

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

