const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  chattedUsers: [{
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    messages: [{
      text: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  receivedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    messages: [{
      text: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  }]
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
