const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

const postSchema = new mongoose.Schema({
    image:{
        type:String,
    required:true    
    },
    caption:{
        type:String,
        required:true
        
    },
    hashtag:{
        type:String,
        
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"like"
    }],
    comments: [{ // Array of comments referencing the Comment model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment'
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
    
}
)

const likeSchema= new mongoose.Schema({
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        count: {
            type: Number,
            default: 0 
        }
    },
    likedby:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
})

const commentSchema = new mongoose.Schema({
    post: { // Reference to the Post model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, // Assuming userId is stored as ObjectId
        ref: 'User' // Reference to the User model where user details are stored
    }
});

module.exports = {
    PostSchema: mongoose.model('Post', postSchema),
    CommentSchema: mongoose.model('comment', commentSchema),
    LikeSchema:mongoose.model("like",likeSchema) // Assuming 'Post' is the name of your model
}