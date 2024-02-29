const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRouter = require('./routes/authRouter');
const wishlistrouter=require("./routes/wishlistRouter")
const cartRouter = require('./routes/cartRouter'); // Corrected import
const productRouter = require('./routes/productRouter');
const postRouter = require("./routes/postRouter")
const followRouter=require("./routes/followRouter")
const bodyParser = require("body-parser");
const app = express();
const port = 3001;
require('dotenv').config();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

// Middleware
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// MongoDB connection using Mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });

// Routes
app.use('/auth', authRouter);
app.use('/cart', cartRouter);
app.use('/wishlist',wishlistrouter)
app.use('/posts',postRouter)
app.use('/admin', productRouter);
app.use('/follows', followRouter);
app.get('/protected', (req, res) => {
  res.json({ message: 'Access granted' });
});
