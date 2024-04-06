const express = require('express');
const postController = require('../Controllers/postController');
const verifyToken = require("../middleware/userAuth")

const router = express.Router();
router.use(verifyToken)
// Route to create a new post
router.post('/createpost', postController.createPost);
router.post('/commentpost', postController.commentPost);
router.get('/getAllComment/:postId', postController.getPostComments);
router.post('/likepost', postController.likepost);
router.get('/getposts/:perPage', postController.getLatestPosts);
router.get('/getpostcomment/:postId', postController.getPostComments);
router.get('/getapost/:postId', postController.getAPost);
router.delete('/delete/:postId', postController.deletePost);

module.exports = router;

