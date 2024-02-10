const User = require("../models/user")
const Product = require("../models/productModel")

exports.addToWishlist = async (req, res) => {
  try {
    const userId = req. query.userId; // Retrieve userId from query parameters
    console.log(userId)
    const { productId } = req.params
    const product = await Product.findById(productId);
    const user = await User.findById(userId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const existingwishlistItem = user.wishlist.find(item => item.productId.toString() === productId);
    if (existingwishlistItem) {
      return res.status(200).json({ message: "Product already in wishlist" });
    } else {
      user.wishlist.push({ productId: product._id });
    }
    await user.save();
    return res.status(200).json({ message: 'Product added to wishlist successfully' });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

exports.removeFromCart = async (req,res)=>{
  try {
    const { productId } = req.params;
    const {userid} = req.body; 
    const user = await User.findById(userid);
    // User object attached by authentication middleware
    user.cart = user.wishlist.filter(item => item.productId.toString() !== productId);
    await user.save();
    res.status(200).json({ message: 'Product removed from wishlist successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

exports.getWishlist = async (req,res)=>{
  try {
    const {userid}=req.body
    const user=  await User.findById(userid).populate('wishlist.productId')
    console.log(user)
    if(!user){
      return res.status(404).json({ error: 'User not found' });
    }
    if(user.wishlist===0){
      return res.status(200).json({message:"wishlist is empty"})
    }
    res.status(200).json(user.wishlist);
  } catch (error) {
    console.error(error)
    res.status(500).json({error:"internal server error"})
  }
}