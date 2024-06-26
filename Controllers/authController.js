const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Post = require('../models/postModal');

const registerUser = async (req, res) => {
  const { email, password,image,name } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ email, password: hashedPassword,username:name });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log(user.id)
    const id=user.id
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id}, process.env.JWT_SECRET, { expiresIn: "48h" });
    const existingUser = await User.findOne({ email });

    res.status(200).json({ status: "succes", message: "Login Successfull", data: token, id,user:existingUser.username?existingUser.username:existingUser.email});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const attachUserPhoto = async (req, res) => {
  const { userId } = req.params;
  const { image,username,bio} = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's image field with the new image
    if (image) {
      user.image = image;
    }
    if (username) {
      user.username = username;
    }
    if (bio) {
      user.bio = bio;
    }
  
    await user.save();

    res.status(200).json({ message: "User photo updated successfully", user: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId)
    .populate('followers', '_id')
    .populate('following', '_id')
   
  const posts= await populateUserPosts(userId)
  console.log(posts)


    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Assuming 'posts' is the field containing post references
   
    const userDetails = {
      username: user.username,
      bio: user.bio,
      email: user.email,
      image: user.image,
      followersCount: user.followers,
      followingCount: user.following,
      postsCount: user.posts.length,
      posts: posts // Array of populated post documents
    };

    res.status(200).json({ user: userDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const populateUserPosts = async (userId) => {
  try {
    // Find all posts where the postedBy field matches the given userId
    const posts = await Post.PostSchema.find({ postedBy: userId }).populate('postedBy');

    return posts;
  } catch (error) {
    console.error('Error populating user posts:', error);
    throw error;
  }
};
const searchUsers = async (req, res) => {
  const { query } = req.query; // Assuming the query parameter is named 'query'
console.log(query)
  try {
    // Perform a case-insensitive search on the username field using regex
    const users = await User.find({ 
      $or: [
          { username: { $regex: query, $options: 'i' } }, // Searching by username
          { email: { $regex: query, $options: 'i' } }     // Searching by email
      ] 
  });    console.log(users)

    res.status(200).json(    users );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser, login, getUserDetails, attachUserPhoto, searchUsers };


