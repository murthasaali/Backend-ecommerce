const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require("body-parser");
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRouter = require('./routes/authRouter');
const wishlistRouter = require("./routes/wishlistRouter");
const cartRouter = require('./routes/cartRouter');
const productRouter = require('./routes/productRouter');
const postRouter = require("./routes/postRouter");
const followRouter = require("./routes/followRouter");
const messageRouter = require('./routes/messageRouter');

// Import Message and User models
const Message = require('./models/messageSchema');
const User = require('./models/user');

// Load environment variables
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Setup middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });

// Initialize HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from this origin
    methods: ["GET", "POST"]
  }
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle sending messages
  socket.on('message', async (data) => {
    console.log('Message received:', data);

    try {
      // Save the message to the database
      const message = new Message({
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message
      });
      await message.save();

      // Update the chattedUsers array for both sender and receiver
      await Promise.all([
        User.findOneAndUpdate(
          { _id: data.senderId },
          { $addToSet: { 'chattedUsers': { userId: data.receiverId, userEmail: data.receiverEmail, lastChatTime: new Date() } } }
        ),
        User.findOneAndUpdate(
          { _id: data.receiverId },
          { $addToSet: { 'chattedUsers': { userId: data.senderId, userEmail: data.senderEmail, lastChatTime: new Date() } } }
        )
      ]);

      // Emit the message to the receiver's socket connection
      io.to(data.receiverId).emit('message', data);

      // Broadcast the message to all connected clients (optional)
      // io.emit('message', data);
    } catch (error) {
      console.error('Error saving message:', error.message);
    }
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

// Define routes
app.use('/auth', authRouter);
app.use('/messages', messageRouter); // Use message router
app.use('/cart', cartRouter);
app.use('/wishlist', wishlistRouter);
app.use('/posts', postRouter);
app.use('/admin', productRouter);
app.use('/follows', followRouter);
app.get('/protected', (req, res) => {
  res.json({ message: 'Access granted' });
});
