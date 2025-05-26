// required imports
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const socket = require("socket.io");

// route imports
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/msgRoutes");

// middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type");
  next();
});

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
  cors : {
    origin : process.env.FRONTEND_URL,
    credentials : true
  }
})

let onlineUsers = new Map();

io.on("connection", (socket) => {
  let chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  })

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if(sendUserSocket){
      socket.to(sendUserSocket).emit("msg-recieve", data.message);
    }
  })
})