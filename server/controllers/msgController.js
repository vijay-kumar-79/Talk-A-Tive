const Messages = require("../models/msgModel");
const { uploadToCloudinary } = require("../config/clodinary");

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    
    let messageData = {};
    
    if (req.file) {
      // Handle image upload
      const result = await uploadToCloudinary(req.file.buffer);
      messageData = {
        image: {
          public_id: result.public_id,
          url: result.secure_url
        }
      };
    } else if (message) {
      // Handle text message
      messageData = { text: message };
    } else {
      return res.status(400).json({ msg: "Message or image is required" });
    }

    const data = await Messages.create({
      message: messageData,
      users: [from, to],
      sender: from,
    });

    if (data) {
      return res.json({ msg: "Message added successfully!", message: data });
    } else {
      return res.json({ msg: "Failed to add message to database!" });
    }
  } catch (ex) {
    next(ex);
  }
};

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        image: msg.message.image,
        timestamp: msg.updatedAt
      };
    });
    
    res.json({ projectedMessages });
  } catch (ex) {
    next(ex);
  }
};