// cartRouter.js
const express = require('express');
const router = express.Router();
const  wishlistController= require('../Controllers/wishlistController'); // corrected import path
const verifyToken = require("../middleware/userAuth")
// Middleware to authenticate the user
router.use(verifyToken);

// Route to add a product to the user's cart
router.post('/add-to-wishlist/:productId', wishlistController.addToWishlist);

// Route to remove a product from the user's cart
router.get('/getwishlist', wishlistController.getWishlist);

// Route to get the user's cart items

module.exports = router; // exporting router instead of cartRouter
