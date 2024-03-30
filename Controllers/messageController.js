const Message = require('../models/messageSchema');
const User = require('../models/user');
const { ObjectId } = require('mongodb');

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { receiverId } = req.params;
    
    // Find the user message document for the current user
    const userMessages = await Message.findOne({ userId: userId });

    if (!userMessages) {
      return res.status(404).json({ message: 'User message not found' });
    }
    
    // Find the entry in the chattedUsers array where receiverId matches the provided receiverId
    const chattedUserEntry = userMessages.chattedUsers.find(entry => entry.receiverId.toString() === receiverId);
    
    // Find the entry in the receivedUsers array where userId matches the provided receiverId
    const receivedUserEntry = userMessages.receivedUsers.find(entry => entry.userId.toString() === receiverId);

    if (!chattedUserEntry && !receivedUserEntry) {
      return res.status(404).json({ message: `No messages found for receiverId: ${receiverId}` });
    }

    // Combine and sort messages from both sent and received messages
    let allMessages = [];
    if (chattedUserEntry) {
      // Add sent messages with "sent" type
      allMessages = allMessages.concat(chattedUserEntry.messages.map(message => ({ ...message.toObject(), type: "sent" })));
    }
    if (receivedUserEntry) {
      // Add received messages with "received" type
      allMessages = allMessages.concat(receivedUserEntry.messages.map(message => ({ ...message.toObject(), type: "received" })));
    }
    
    // Sort messages by timestamp in descending order
    allMessages.sort((a, b) => b.timestamp - a.timestamp);

    // Get the last 20 messages
    const messages = allMessages.slice(0, 20);
   
    // console.log(messages)    

    res.status(200).json( {messages} );
  } catch (error) {
    console.error('Error fetching user message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getChattedUsers= async (req, res) => {
  try {
    const userId = req.userId;

    // Find the user message document for the current user
    const userMessages = await Message.findOne({ userId: userId });

    if (!userMessages) {
      return res.status(404).json({ message: 'User message not found' });
    }

    // Extract receiverIds from chattedUsers array
    const receiverIds = userMessages.chattedUsers.map(entry => entry.receiverId);
    const senderIds = userMessages.receivedUsers.map(entry => entry.userId);
    const uniqueChattedUsersArray=receiverIds.concat(senderIds)
    // Find user details for each receiverId
    // const uniqueChattedUsers = await User.find({ _id: { $in: receiverIds } }, { email: 1, lastSeen: 1, image: 1, username: 1 });
    const uniqueChattedUsers = await User.find({ _id: { $in: uniqueChattedUsersArray } }, { email: 1, lastSeen: 1, image: 1, username: 1 });

console.log(uniqueChattedUsers)
    res.status(200).json({ uniqueChattedUsers });
  } catch (error) {
    console.error('Error fetching chatted users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};