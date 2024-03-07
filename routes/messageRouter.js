const express = require('express');
const router = express.Router();
const verifytoken=require("../middleware/userAuth")
const messageController = require('../Controllers/messageController');
// Route to get chat history for a specific user
router.get('/user/:receiverId',verifytoken, messageController.getChatHistory);
router.get('/getchattedusers',verifytoken, messageController.getChattedUsers);


module.exports = router;
