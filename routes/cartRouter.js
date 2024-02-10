// cartRouter.js
const express = require('express');
const router = express.Router();
const cartController = require('../Controllers/cartController'); // corrected import path
const verifyToken = require("../middleware/userAuth")
// Middleware to authenticate the user
router.use(verifyToken);

// Route to add a product to the user's cart
router.post('/add-to-cart/:productId', cartController.addToCart);

// Route to remove a product from the user's cart
router.delete('/remove-from-cart/:productId', cartController.removeFromCart);

// Route to get the user's cart items
router.get('/getcart', cartController.getCart);


module.exports = router; // exporting router instead of cartRouter
