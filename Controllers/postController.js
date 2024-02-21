const {PostSchema} = require("../models/postModal") // Assuming your schemas are in a 'models' directory

const postController = {
  createPost: async (req, res) => {
    try {
      // Extract data from request body
      const { image, caption } = req.body;

      // Create new post
      const newPost = await PostSchema.create({
        image,
        caption
      });

      // Return success response
      return res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  commentPost: async (req, res) => {
    try {
      const { postId } = req.params; // Assuming postId is passed in the URL params
      const { text, author } = req.body; // Assuming author (userId) is passed in the request body

      // Check if the post exists
      const post = await PostSchema.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Create new comment
      const newComment = await CommentSchema.create({
        post: postId,
        text,
        author // Assuming author is the userId
      });

      // Add the comment to the post
      post.comments.push(newComment._id);
      await post.save();

      // Return success response
      return res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
      console.error('Error commenting on post:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

module.exports = postController;
