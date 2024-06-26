const {PostSchema,CommentSchema,LikeSchema} = require("../models/postModal") // Assuming your schemas are in a 'models' directory
const Notification = require('../models/notificationSchema')
const postController = {
    createPost: async (req, res) => {
    try {
      // Extract data from request body
      const { image, caption,hashtag } = req.body;
      console.log(image,caption)
      // Create new post
      const newPost = await PostSchema.create({
        image,
        caption,
        postedBy:req.userId
        ,hashtag
      });
      console.log(newPost)


      // Return success response
      return res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  deletePost: async (req, res) => {
    try {
      // Extract post ID from request parameters
      const {postId} = req.params;
      console.log("postid",postId)
  
      // Check if the post exists
      const post = await PostSchema.findById(postId);
      console.log(post)
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      // Check if the user is authorized to delete the post
      if (post.postedBy != req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
  
      // Delete the post
      await PostSchema.findByIdAndDelete(postId);
  
      // Return success response
      return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting post:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
,  
  commentPost: async (req, res) => {
    try {
      const { text,postId } = req.body; // Assuming author (userId) is passed in the request body
  console.log(postId)
      // Check if the post exists
      const post = await PostSchema.findById(postId);
      console.log(post)
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      // Create new comment
      const newComment = await CommentSchema.create({
        post: postId,
        text,
        author:req.userId // Assuming author is the userId
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
  },
  likepost: async (req, res) => {
    try {
      const { postId ,username} = req.body;
      const post = await PostSchema.findById(postId);
      if (!post) {
        return res.status(400).json({ error: "Post not found" });
      }
  
      let existingLike = await LikeSchema.findOne({ post: postId, likedby: req.userId });
      if (existingLike) {
        // If like exists, remove it (dislike)
        await LikeSchema.deleteOne({ _id: existingLike._id });
  
        // Remove like reference from post
        post.likes.pull(existingLike._id);
        await post.save();
  
        // Update likes count
        post.likesCount -= 1;
        await post.save();

        // Save the updated notification
        await notification.save();
  
        return res.status(200).json({ message: 'Post disliked successfully' });
      }
  
      const newLike = await LikeSchema.create({
        post: postId,
        likedby: req.userId
      });
  
      post.likes.push(newLike._id);
      await post.save();
  
      post.likesCount += 1;
      await post.save();
  
      // Create notification message
      const notificationMessage = `${username} liked your post`;
      const notificationImage = post.image; // Get post image
  
      // Find an existing notification for the receiverId
      let notification = await Notification.findOne({ receiverId: post.postedBy });
  
      // If a notification doesn't exist, create a new one
      if (!notification) {
        notification = new Notification({ receiverId: post.postedBy, messages: [] });
      }
  
      // Push the new message to the messages array
      notification.messages.push({ text: notificationMessage, userId: req.userId, image: notificationImage });
  
      // Save the updated notification
      await notification.save();
  
      return res.status(201).json({ message: 'Post liked successfully', like: newLike });
    } catch (error) {
      console.error('Error liking post:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  
  getLatestPosts: async (req, res) => {
    try {
        // Get the page number from the request query parameters, default to 1 if not provided
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const perPage = req.params.perPage

        // Calculate the skip value based on the page number
        const skip = (page - 1) * perPage;

        // Query the database for posts for the specified page, populating the 'postedBy' field to get full user details
        const latestPosts = await PostSchema.find()
            .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
            .skip(skip) // Skip posts based on the page number
            .limit(perPage) // Limit the number of posts returned per page
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'email',
                    // Select specific fields of the User model
                }
            })
            .populate('postedBy', 'email image username'); // Populate the 'postedBy' field with specific fields of the User model

        // Iterate through each post and calculate the count of likes and comments
        const postsWithCounts = await Promise.all(latestPosts.map(async (post) => {
            // Count the number of likes for the post
            const likesCount = await LikeSchema.countDocuments({ post: post._id });
            console.log(post)
            // Count the number of comments for the post

            // Return the post along with the counts and the details of the user who posted it
            return {
                _id: post._id,
                image: post.image,
                caption: post.caption,
                createdAt: post.createdAt,
                likesCount,
                comments: post.comments,
                hashtag: post.hashtag,
                postedBy: post.postedBy // Assuming 'postedBy' is populated, it will contain the full details of the user
            };
        }));

        // Return success response with the latest posts and their counts
        return res.status(200).json({ latestPosts: postsWithCounts });
    } catch (error) {
        console.error('Error fetching latest posts:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
},


  getPostComments: async (req, res) => {
    try {
      const { postId } = req.params; // Assuming postId is passed in the URL params

      // Query the database for comments associated with the given postId
      const comments = await CommentSchema.find({ post: postId })
        .populate('author', 'username email'); // Populate the author field with user details (username and email)

      // Return success response with the comments
      return res.status(200).json({ comments });
    } catch (error) {
      console.error('Error fetching post comments:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },getPostComments: async (req, res) => {
    try {
        const { postId } = req.params; // Assuming postId is passed in the URL params
      console.log(postId)
        // Query the database for comments associated with the given postId
        const comments = await CommentSchema.find({ post: postId })
            .populate('author', ' email image'); // Populate the author field with user details (username, email, and image)

        // Return success response with the comments
        console.log(comments)
        return res.status(200).json({ comments });
    } catch (error) {
        console.error('Error fetching post comments:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
},getAPost: async (req, res) => {
  try {
      const { postId } = req.params; // Assuming postId is passed in the URL params

      // Query the database to find the post with the given postId
      const post = await PostSchema.findById(postId)
          .populate('comments')
          .populate('postedBy', 'email image username');

      // If the post is not found, return a 404 error
      if (!post) {
          return res.status(404).json({ error: 'Post not found' });
      }

      // Return success response with the post details
      return res.status(200).json({ post });
  } catch (error) {
      console.error('Error fetching a post:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
},



};



module.exports = postController;
