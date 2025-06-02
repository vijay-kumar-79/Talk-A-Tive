// required imports
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const socket = require("socket.io");

// route imports
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/msgRoutes");

// Enhanced CORS configuration
const allowedOrigins = [
  'https://talk-a-tive-eight.vercel.app',
  'http://localhost:3000' // for local development
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// middlewares
const app = express();
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(MONGO_URI);
    console.log(err.message);
  });

// Test route
app.get("/ping", (_, res) => {
  res.json({ msg: "Chat server is running!" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Listen on PORT
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// ********************** Socket.IO Setup **********************

const io = socket(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

let onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      // Emit the entire data object, not just the message
      socket.to(sendUserSocket).emit("msg-receive", {
        message: data.message,
        image: data.image,
        from: data.from
      });
    }
  });

  socket.on("disconnect", () => {
    // Clean up disconnected users
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});