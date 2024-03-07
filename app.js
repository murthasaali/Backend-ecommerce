// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRouter = require('./routes/authRouter');
const wishlistrouter=require("./routes/wishlistRouter")
const cartRouter = require('./routes/cartRouter'); // Corrected import
const productRouter = require('./routes/productRouter');
const postRouter = require("./routes/postRouter")
const followRouter=require("./routes/followRouter")
const messageRouter = require('./routes/messageRouter');

const bodyParser = require("body-parser");
const socketIo = require('socket.io');
const http = require('http');

// Import Message model
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
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from this origin
    methods: ["GET", "POST"]
  }
});

// Socket.IO event handlers
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

      // Update the chattedUsers array for the sender
      const receiver = await User.findById(data.receiverId);
      const sender = await User.findById(data.senderId);
  
      console.log(receiver)
      console.log(sender)
      

      sender.chattedUsers.addToSet({
        userId: receiver._id,
        userEmail: receiver.email,
        lastChatTime: new Date()
      });
      await sender.save();

      // Update the chattedUsers array for the receiver
      receiver.chattedUsers.addToSet({
        userId: sender._id,
        userEmail: sender.email,
        lastChatTime: new Date()
      });
      await receiver.save();

      // Broadcast the message to all connected clients
      io.emit('message', data);
    } catch (error) {
      console.error('Error saving message:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

// Define routes
// Add your routes here if needed
app.use('/auth', authRouter);
app.use('/messages', messageRouter); // Use message router

app.use('/cart', cartRouter);
app.use('/wishlist',wishlistrouter)
app.use('/posts',postRouter)
app.use('/admin', productRouter);
app.use('/follows', followRouter);
app.get('/protected', (req, res) => {
  res.json({ message: 'Access granted' });
});