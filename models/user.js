// userModel.js
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
const wishlisSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
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
  cart: [cartItemSchema]
  ,wishlist:[wishlisSchema]
});
const User = mongoose.model('User', userSchema);

module.exports = User;
