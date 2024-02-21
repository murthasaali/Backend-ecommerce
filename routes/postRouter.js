const express = require('express');
const postController = require('../Controllers/postController');

const router = express.Router();

// Route to create a new post
router.post('/createpost', postController.createPost);
router.post('/commentpost', postController.commentPost);

module.exports = router;
