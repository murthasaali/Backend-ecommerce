const Product = require('../models/productModel');
const User = require('../models/user')
const jwt =require("jsonwebtoken")

  const adminController = {

 login: async (req, res) => {
  const { email, password } = req.body;
  console.log("admin:",email,password)
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { email },
      process.env.ADMIN_ACCES_TOKEN_SECRET,{ expiresIn: "48h" }
    );
    return res.status(200).send({
      statu: "Succes",
      message: "Admin registratin succs full",
      data: token,
    });
  } else {
    return res.status(404).json({
      status: "error",
      message: "Thsi is no an admin🧐 ",
    });
  }
},


    getAllUsers: async (req, res) => {
      try {
        const users = await User.find();
        console.log(req)
        res.json(users);
      } catch (error) {
        console.error('Error getting users:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },
    addProduct: async (req, res) => {
      try {
        const { name, description, price, category, image } = req.body;
        console.log("Product details:", name, description, price, category, image);
  
        // Create a new Product instance with the provided data
        const newProduct = new Product({ name, description, price, category, image });
  
        // Save the new product to the database
        const savedProduct = await newProduct.save();
  
        // Send the saved product as a JSON response
        res.json(savedProduct);
      } catch (error) {
        console.error('Error adding product:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },
  

  // Example in adminController.js
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find();
      console.log(products)
      res.json(products);
    } catch (error) {
      console.error('Error getting products:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  updateProduct: async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, image } = req.body;
    console.log(name, description, price, category, image)

    try {
      // Find the existing product by ID
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Update product fields if provided
      if (name) product.name = name;
      if (description) product.description = description;
      if (price) product.price = price;
      if (category) product.category = category;
      if (image) product.image = image;

      // Save the updated product
      await product.save();

      res.status(200).json({
        status: 'success',
        message: 'Successfully updated a product.',
        data: product,
      });
    } catch (error) {
      console.error('Error updating product:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  getProductById: async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {

      const product = await Product.findById(id);


      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.status(200).json({
        status: 'success',
        message: 'Successfully fetched product details.',
        data: product,
      });
    } catch (error) {
      console.error('Error fetching product by ID:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },




  deleteAproduct: async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {

        return res.status(404).json({ error: "product not found" })



      }

      const deletedProduct = await Product.findByIdAndDelete(id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error delteting product:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = adminController;
