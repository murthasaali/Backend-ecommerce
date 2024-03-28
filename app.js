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
    origin: "http://localhost:3000  ", // Allow requests from this origin
    methods: ["GET", "POST"]
  }
});

// Socket.IO event handlers
// Import Message model

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle joining room
  socket.on('join', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room ${roomId}`);
  });

  // Handle sending messages
  socket.on('message', async (data) => {
    console.log('Message received:', data);

    try {
      // Find or create the message document for the sender
      let user = await Message.findOne({ userId: data.senderId });

      if (!user) {
        user = new Message({ userId: data.senderId, chattedUsers: [] });
      }

      // Find the chatted person object for the receiver within the sender's message document
      let receiverIndex = user.chattedUsers.findIndex(person => person.receiverId.toString() === data.receiverId);

      // If the chatted person object for the receiver doesn't exist, create a new one
      if (receiverIndex === -1) {
        user.chattedUsers.push({ receiverId: data.receiverId, messages: [] });
        receiverIndex = user.chattedUsers.length - 1;
      }

      // Add the message to the receiver's messages array within the chatted person object
      user.chattedUsers[receiverIndex].messages.push({ text: data.message });
      let receiverMessage = await Message.findOne({ userId: data.receiverId });
      if (!receiverMessage) {
        receiverMessage = new Message({ userId: data.receiverId, receivedUsers: [] });
      }
      let senderIndex = receiverMessage.receivedUsers.findIndex(user => user.userId.toString() === data.senderId);
      if (senderIndex === -1) {
        receiverMessage.receivedUsers.push({ userId: data.senderId, messages: [] });
        senderIndex = receiverMessage.receivedUsers.length - 1;
      }
      receiverMessage.receivedUsers[senderIndex].messages.push({ text: data.message });

      // Save the message document
      await Promise.all([user.save(), receiverMessage.save()]);


      // Emit the message to the receiver's room
      io.to(data.receiverId).emit('message', data);

      // Optionally, broadcast the message to all connected clients
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