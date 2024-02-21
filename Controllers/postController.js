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
  }
};

module.exports = postController;
