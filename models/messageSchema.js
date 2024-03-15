const mongoose = require('mongoose');

// Define message schema
const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
        ref: 'User'// Reference to the User model
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message: {
    type: String,
    require:true
  },    
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create Message model
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
