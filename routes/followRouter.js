const express = require('express');
const router = express.Router();
const followController = require('../Controllers/followController');
const verifyToken=require("../middleware/userAuth")
router.use(verifyToken)
// Route to follow a user
router.post('/follow/:userId', followController.followUser);

// Route to unfollow a user
router.post('/unfollow/:followerId', followController.unfollowUser);
router.get('/unfollowingusers/:userId', followController.getAllUnfollowingUsers);
router.get('/getAllFollowers/:userId', followController.getFollowers);

module.exports = router;
