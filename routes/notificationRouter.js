const express = require('express');
const router = express.Router();
const verifytoken=require("../middleware/userAuth")
const notificationController = require('../Controllers/notificationController');
router.get('/getnotification',verifytoken, notificationController.getNotification);

module.exports = router;