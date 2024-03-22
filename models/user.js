const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    default: 1
  }
});

const wishlistSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }
});

const followerSchema = new Schema({
  followerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Define chatted user schema
// const chattedUserSchema = new Schema({
//   receiverId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User' // Reference to the User model
//   },
//   lastChatTime: {
//     type: Date,
//     default: Date.now
//   }
// });

const chattedUserSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User' // Reference to the User model
  },
  lastChatTime: {
    type: Date,
    default: Date.now
  }
});
  

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  username: {
    type: String,
  },
  bio:{
    type:String,
  },
  image: {
    type: String,
  },
  cart: [cartItemSchema],
  wishlist: [wishlistSchema],
  followers: [followerSchema], // Array of followers
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  chattedUsers: [chattedUserSchema], // Array of chatted users
});

const User = mongoose.model('User', userSchema);

module.exports = User;
