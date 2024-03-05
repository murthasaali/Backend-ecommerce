const express = require('express');
const postController = require('../Controllers/postController');
const verifyToken = require("../middleware/userAuth")

const router = express.Router();
router.use(verifyToken)
// Route to create a new post
router.post('/createpost', postController.createPost);
router.post('/commentpost', postController.commentPost);
router.post('/likepost', postController.likepost);
router.get('/getposts', postController.getLatestPosts);
router.get('/getpostcomment/:postId', postController.getPostComments);
router.get('/delete/:postId', postController.deletePost);

module.exports = router;
