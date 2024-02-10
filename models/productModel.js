const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
  category:{type:String},   
  price: { type: Number},
  image: { type: String }, // Store image data as Buffer
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
