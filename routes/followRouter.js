const express = require('express');
const router = express.Router();
const followController = require('../Controllers/followController');
const verifyToken=require("../middleware/userAuth")
router.use(verifyToken)
// Route to follow a user
router.post('/follow/:userId', followController.followUser);

// Route to unfollow a user
router.post('/unfollow/:followerId', followController.unfollowUser);
router.get('/unfollowusers/:userId', followController.getUnfollowedUsers);

module.exports = router;
