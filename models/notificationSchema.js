const mongoose = require('mongoose');

// Define a schema for message with text, userId, and timestamp
const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  text: {
    type: String,
    required: true
  },
  image: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const notificationSchema = new mongoose.Schema({
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  messages: [messageSchema], // Embed message schema as an array
  time: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
