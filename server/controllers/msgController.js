const Messages = require("../models/msgModel");
const { uploadToCloudinary } = require("../config/clodinary");
const Group = require("../models/grpModel");

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    // Get isGroup from body or default to false
    const isGroup = req.body.isGroup === "true" || req.body.isGroup === true;

    // Validate input
    if (!from || !to) {
      return res.status(400).json({ msg: "Sender and recipient are required" });
    }

    let messageData = {};

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      messageData = {
        image: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      };
    } else if (message) {
      messageData = { text: message };
    } else {
      return res.status(400).json({ msg: "Message or image is required" });
    }

    // Prepare message object
    const messageObj = {
      message: messageData,
      sender: from,
      isGroup: isGroup, // Use the properly parsed boolean
    };

    // Set proper reference
    if (isGroup) {
      messageObj.group = to;
      messageObj.users = []; // Explicit empty array for group messages
    } else {
      messageObj.users = [from, to];
      messageObj.group = undefined; // Explicitly remove group reference
    }

    console.log("Creating message:", messageObj); // Debug log

    const data = await Messages.create(messageObj);

    return res.json({
      msg: "Message added successfully!",
      message: data,
    });
  } catch (ex) {
    console.error("Message creation error:", ex);
    next(ex);
  }
};

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    const isGroup = req.body.isGroup === "true" || req.body.isGroup === true;

    let query;
    if (isGroup) {
      query = {
        group: to,
        isGroup: true,
      };
    } else {
      query = {
        users: { $all: [from, to] },
        isGroup: false,
      };
    }

    const messages = await Messages.find(query)
      .sort({ createdAt: 1 })
      .populate("sender", "username avatarImage")
      .populate("group"); // Populate group if needed

    let projectedMessages = messages.map((msg) => ({
      fromSelf: msg.sender._id.toString() === from,
      message: msg.message.text,
      image: msg.message.image,
      timestamp: msg.createdAt,
      isGroup: msg.isGroup,
      sender: {
        _id: msg.sender._id,
        username: msg.sender.username,
        avatarImage: msg.sender.avatarImage,
      },
    }));
    res.json({projectedMessages : projectedMessages});
  } catch (ex) {
    next(ex);
  }
};
