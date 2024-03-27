const Message = require('../models/messageSchema');
const User = require('../models/user');

exports.getChatHistory = async (req, res) => {
  const receiverId = req.params.receiverId;

  try {
    console.log(req.userId,receiverId)
    const messages = await Message.find({
      $or: [
        { $and: [{ senderId: req.userId }, { receiverId: receiverId }] }, // Sender is req.userId and receiver is receiverId
        { $and: [{ senderId: receiverId }, { receiverId: req.userId }] }  // Sender is receiverId and receiver is req.userId
      ]
    }).sort({ timestamp: 'desc' }).limit(20);
    
    console.log(messages)

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