const {PostSchema,CommentSchema,LikeSchema} = require("../models/postModal") // Assuming your schemas are in a 'models' directory

const postController = {
  createPost: async (req, res) => {
    try {
      // Extract data from request body
      const { image, caption } = req.body;
      // Create new post
      const newPost = await PostSchema.create({
        image,
        caption,
        postedBy:req.userId
      });
      console.log(newPost)


      // Return success response
      return res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
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
  likepost : async (req,res)=>{
    try {
      const {postId}=req.body
      const post =await PostSchema.findById(postId)
      if(!post) {
        res.status(400).json({error:"Post not Found"})
      }
      
     
      let existingLike = await LikeSchema.findOne({ post: postId, likedby: req.userId });
      console.log(existingLike);
      if (existingLike) {
        // If like exists, remove it (dislike)
        await LikeSchema.deleteOne({ _id: existingLike._id });
  
        // Remove like reference from post
        post.likes.pull(existingLike._id);
        await post.save();
  
        // Update likes count
        post.likesCount -= 1;
        await post.save();
  
        return res.status(200).json({ message: 'Post disliked successfully' });
      }
      const newLike= await LikeSchema.create({
        post:postId,
        likedby:req.userId

      })

      post.likes.push(newLike._id);
      await post.save();

      post.likesCount += 1;
      await post.save();

      return res.status(201).json({ message: 'Post liked successfully', like: newLike });
    } catch (error) {
      console.error('Error liking post:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
   getLatestPosts :async (req, res) => {
    try {
        // Query the database for the latest 10 posts, populating the 'postedBy' field to get full user details
        const latestPosts = await PostSchema.find()
            .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
            .limit(10) // Limit the number of posts returned to 10
            .populate('postedBy', 'username email profilePicture'); // Populate the 'postedBy' field with specific fields of the User model

        // Iterate through each post and calculate the count of likes and comments
        const postsWithCounts = await Promise.all(latestPosts.map(async (post) => {
            // Count the number of likes for the post
            const likesCount = await LikeSchema.countDocuments({ post: post._id });

            // Count the number of comments for the post
            const commentsCount = await CommentSchema.countDocuments({ post: post._id });

            // Return the post along with the counts and the details of the user who posted it
            return {
                _id: post._id,
                image: post.image,
                caption: post.caption,
                createdAt: post.createdAt,
                likesCount,
                commentsCount,
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
  }
};


module.exports = postController;
