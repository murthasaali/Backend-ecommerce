const mongoose = require('mongoose');

// Define a schema for message with text and timestamp
const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const notificationSchema = new mongoose.Schema({
  receiverId: {
    type: mongoose.Schema.Types.ObjectId, // assuming userId is stored as ObjectId
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
