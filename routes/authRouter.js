const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');

// Register a new user (POST)
router.post('/register', authController.registerUser);

// Login user (POST)
router.post('/login', authController.login);

module.exports = router;
