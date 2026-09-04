// required imports
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const socket = require("socket.io");
const Group = require("./models/grpModel");

// route imports
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/msgRoutes");
const groupRoute = require("./routes/grpRoutes");

const corsOptions = {
  origin: ["https://talk-a-tive-eight.vercel.app", "http://localhost:3000"],
  credentials: true,
};

// middlewares
const app = express();
app.use(express.json());
app.use(cors(corsOptions));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
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
app.use("/api/groups", groupRoute);

// Listen on PORT
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// ********************** Socket.IO Setup **********************

const io = socket(server, {
  cors: corsOptions,
});

let onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", async (data) => {
    try {
      const payload = {
        ...data,
        timestamp: new Date(),
        sender: data.sender || {
          _id: data.from,
          username: "Unknown",
          avatarImage: "",
        },
      };

      if (data.isGroup) {
        const group = await Group.findById(data.to).populate("participants");
        if (!group) return;

        // Emit to all participants including the sender for a consistent view
        group.participants.forEach((participant) => {
          const memberSocket = onlineUsers.get(participant._id.toString());
          if (memberSocket) {
            io.to(memberSocket).emit("msg-receive", {
              ...payload,
              groupId: data.to,
              fromSelf: participant._id.toString() === data.from,
            });
          }
        });
      } else {
        const recipientSocket = onlineUsers.get(data.to);
        const senderSocket = onlineUsers.get(data.from);

        if (recipientSocket) {
          io.to(recipientSocket).emit("msg-receive", {
            ...payload,
            fromSelf: false,
          });
        }
        if (senderSocket) {
          io.to(senderSocket).emit("msg-receive", {
            ...payload,
            fromSelf: true,
          });
        }
      }
    } catch (err) {
      console.error("Socket message error:", err);
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