const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const userSchema = new Schema(
  {
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
    bio: {
      type: String,
    },
    image: {
      type: String,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ], // Array of followers
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
