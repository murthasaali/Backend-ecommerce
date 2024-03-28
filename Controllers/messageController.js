const Message = require('../models/messageSchema');
const User = require('../models/user');

exports.getChatHistory = async (req, res) => {
  const receiverId = req.params.receiverId;

  try {
    const messages = await Message.find({
      $or: [
        {
          $and: [
            { 'chattedUsers.receiverId': req.userId }, // Sender is receiverId
            { 'userId': receiverId } // Receiver is req.userId
          ]
        },
        {
          $and: [
            { 'chattedUsers.receiverId': receiverId }, // Sender is req.userId
            { 'userId': req.userId } // Receiver is receiverId
          ]
        }
      ]
    }).sort({ 'chattedUsers.messages.timestamp': 'desc' }).limit(20);
    
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getChattedUsers = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId)
      .populate({
        path: 'chattedUsers.userId',
        select: 'email image'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract chatted users
    const chattedUsers = user.chattedUsers;

    // Use Set to remove duplicates based on userId
    const uniqueChattedUsers = Array.from(new Set(chattedUsers.map(user => user.userId.toString())))
      .map(userId => chattedUsers.find(user => user.userId.toString() === userId));

    res.status(200).json({ uniqueChattedUsers });
  } catch (error) {
    console.error('Error fetching chatted users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};