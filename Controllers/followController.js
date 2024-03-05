const User = require('../models/user');

// Controller function to follow a user
exports.followUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user to follow
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the current user is already following the user
    const currentUser = await User.findById(req.userId);
    
    console.log(currentUser)
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: "You are already following this user" , data:currentUser});
    }

    // Update the current user's following list
    currentUser.following.push(userId);
    userToFollow.followers.push(req.userId)
    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ message: "User followed successfully" ,data:currentUser});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller function to unfollow a user
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


exports.getUnfollowedUsers = async (req, res) => {
  try {
    const userId = req.params.userId;

    console.log("hi",userId)
    // Find the user by ID including the users they are following
    const user = await User.findById(userId).populate('following', 'username');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get IDs of users the user is following
    const followingIds = user.following.map(user => user._id);

    // Find all users except the current user
    const allUsers = await User.find({ _id: { $ne: userId } });

    // Filter out users the user is already following
    const usersNotFollowed = allUsers.filter(u => !followingIds.includes(u._id));

    res.json(usersNotFollowed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}
