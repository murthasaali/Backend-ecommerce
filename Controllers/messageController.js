const Message = require('../models/messageSchema');
const User = require('../models/user');

exports.getChatHistory = async (req, res) => {
  const receiverId = req.params.receiverId;

  try {
    console.log(req.userId,receiverId)
    const messages = await Message.find({
      $and: [{ senderId: req.userId }, { receiverId: receiverId }]
    }).sort({ timestamp: 'asc' });  
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
        select: 'email image following'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const chattedUsers = user.chattedUsers;
    console.log(user)
    const uniqueChattedUsers = Array.from(
      chattedUsers.reduce((map, chat) => {
        if (!map.has(chat.userId.email) || map.get(chat.userId.email).lastChatTime < chat.lastChatTime) {
          map.set(chat.userId.email, chat);
        }
        return map;
      }, new Map()).values()
    );
    

    res.status(200).json({ uniqueChattedUsers });
  } catch (error) {
    console.error('Error fetching chatted users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
