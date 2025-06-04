const Messages = require("../models/msgModel");
const { uploadToCloudinary } = require("../config/clodinary");
const Group = require("../models/grpModel");

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message, isGroup } = req.body;
    
    let messageData = {};
    
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      messageData = {
        image: {
          public_id: result.public_id,
          url: result.secure_url
        }
      };
    } else if (message) {
      messageData = { text: message };
    } else {
      return res.status(400).json({ msg: "Message or image is required" });
    }

    // Create the message object
    const messageObj = {
      message: messageData,
      sender: from,
      isGroup: isGroup || false  // Ensure isGroup is properly set
    };

    // Set the proper reference based on message type
    if (isGroup) {
      messageObj.group = to;  // Store group ID for group messages
    } else {
      messageObj.users = [from, to];  // Store user IDs for private messages
    }

    const data = await Messages.create(messageObj);

    if (data) {
      return res.json({ 
        msg: "Message added successfully!", 
        message: data,
        isGroup: isGroup  // Include isGroup in response
      });
    } else {
      return res.json({ msg: "Failed to add message to database!" });
    }
  } catch (ex) {
    next(ex);
  }
};

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to, isGroup } = req.body;

    let messages;
    if (isGroup) {
      messages = await Messages.find({ group: to })
        .sort({ updatedAt: 1 })
        .populate('sender', 'username avatarImage');
    } else {
      messages = await Messages.find({
        users: { $all: [from, to] }
      }).sort({ updatedAt: 1 });
    }

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender._id.toString() === from,
        message: msg.message.text,
        image: msg.message.image,
        sender: msg.sender,
        timestamp: msg.updatedAt,
        isGroup: isGroup  // Include isGroup in response
      };
    });
    
    res.json({ projectedMessages });
  } catch (ex) {
    next(ex);
  }
};