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
app.use(cors({
  origin: 'https://unity-swart.vercel.app', // Allow requests from this origin
  methods: ['GET', 'POST',"DELETE",], // Allow only specified HTTP methods
}));

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
    origin: "https://unity-swart.vercel.app/", // Allow requests from this origin
    methods: ["GET", "POST"]
  }
});

// Socket.IO event handlers
// Import a message queue library, such as Bull
const Queue = require('bull');

// Create a new Bull queue instance
const messageQueue = new Queue('messages');

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle joining room
  socket.on('join', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room ${roomId}`);

    // Process queued messages for the current user upon connection
    processQueuedMessages(roomId);
  });

  // Handle sending messages
  socket.on('message', async (data) => {
    console.log('Message received:', data);

    try {
      // Check if the receiver is online
      const receiverSocket = io.sockets.in(data.receiverId);
      if (receiverSocket && receiverSocket.length > 0) {
        // If receiver is online, emit the message directly
        receiverSocket.emit('message', data);
      } else {
        // If receiver is not online, enqueue the message
        await messageQueue.add(data);
      }

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
    } catch (error) {
      console.error('Error handling message:', error.message);
    }
  });
});

// Function to process queued messages for a user upon connection
async function processQueuedMessages(receiverId) {
  const messages = await messageQueue.getJobs(['wait', 'active', 'completed']);
  messages.forEach(async (job) => {
    const data = job.data;
    if (data.receiverId === receiverId) {
      io.to(data.receiverId).emit('message', data);
      await job.remove(); // Remove the message from the queue after delivery
    }
  });
}

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
