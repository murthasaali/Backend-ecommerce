const User = require('../models/user');
const Notification = require('../models/notificationSchema')

exports.followUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(req.userId);
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: "You are already following this user" });
    }

    // Update the current user's following list
    currentUser.following.push(userId);
    userToFollow.followers.push(req.userId);
    await currentUser.save();
    await userToFollow.save();

    // Create notification message
    const notificationMessage = `${currentUser.username} followed you`;


    // Find an existing notification for the receiverId
    let notification = await Notification.findOne({ receiverId: userId });
    console.log(notification);

    // If a notification doesn't exist, create a new one
    if (!notification) {
      notification = new Notification({ receiverId: userId, messages: [] });
    }

    // Push the new message to the messages array
    notification.messages.push({ text: notificationMessage, userId: req.userId });

    // Save the updated notification
    await notification.save();


    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.unfollowUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user to unfollow
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the current user is following the user
    const currentUser = await User.findById(req.userId);
    const index = currentUser.following.indexOf(userId);
    if (index === -1) {
      return res.status(400).json({ message: "You are not following this user" });
    }

    // Remove the user from the following list
    currentUser.following.splice(index, 1);
    await currentUser.save();

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.getAllUnfollowingUsers = async (req, res) => {
  try {
    const userId = req.userId; // Assuming userId is obtained from authentication middleware

    // Find the user by ID including the users they are following
    const user = await User.findById(userId).populate('following', 'username');
    console.log(user)

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get IDs of users the user is following
    const followingIds = user.following.map(user => user._id);

    // Find all users except the current user and those the user is following
    const usersNotFollowed = await User.find({ _id: { $ne: userId, $nin: followingIds } });

    res.json(usersNotFollowed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Controller function to get the followers of a user
// Controller function to get the followers of a user
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by ID including their followers with additional fields
    const user = await User.findById(userId)
      .populate({
        path: 'followers',
        select: 'followerId timestamp',
        options: { sort: { timestamp: -1 }, limit: 20 }, // Sort by timestamp field in descending order, limit to 20 followers
        populate: {
          path: 'User',
          select: 'email image username', // Include only email, image, and username fields
        }
      })
      .select('-password'); // Exclude sensitive fields like password

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
// console.log(user.followers)
    res.json(user.followers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


