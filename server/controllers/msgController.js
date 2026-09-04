const Messages = require("../models/msgModel");
const User = require("../models/userModel");
const Group = require("../models/grpModel");
const { uploadToCloudinary } = require("../config/clodinary");

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
      isGroup: isGroup,
    };

    // Set proper reference
    if (isGroup) {
      messageObj.group = to;
      messageObj.users = []; // Explicit empty array for group messages
    } else {
      messageObj.users = [from, to];
    }

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
      .populate("sender", "username avatarImage");

    const projectedMessages = messages.map((msg) => ({
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
    res.json({ projectedMessages });
  } catch (ex) {
    next(ex);
  }
};

// Chat list: everyone the user has exchanged 1:1 messages with, plus every
// group they belong to, each with its last message for the sidebar preview.
module.exports.getConversations = async (req, res, next) => {
  try {
    const me = req.user._id;

    const groups = await Group.find({ participants: me })
      .populate("admin", "username avatarImage")
      .populate("participants", "username avatarImage");
    const groupIds = groups.map((g) => g._id);

    const [partnerIds, lastMessages] = await Promise.all([
      Messages.distinct("users", { isGroup: false, users: me }).then((ids) =>
        ids.filter((id) => id.toString() !== me.toString())
      ),
      Messages.aggregate([
        {
          $match: {
            $or: [
              { isGroup: false, users: me },
              { isGroup: true, group: { $in: groupIds } },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            // 1:1 messages group by the users array, group messages by group id
            _id: { $cond: [{ $eq: ["$isGroup", true] }, "$group", "$users"] },
            last: { $first: "$$ROOT" },
          },
        },
      ]),
    ]);

    // Map conversation key (partner id or group id) -> last message
    const lastByKey = new Map();
    for (const row of lastMessages) {
      const key = Array.isArray(row._id)
        ? row._id.find((id) => id.toString() !== me.toString()).toString()
        : row._id.toString();
      lastByKey.set(key, row.last);
    }

    const project = (last) => {
      const isImage = last && last.message.image && last.message.image.url;
      return {
        lastMessage: isImage
          ? { image: last.message.image }
          : last
          ? { text: last.message.text }
          : null,
        lastMessageAt: last ? last.createdAt : null,
        lastMessageFromSelf: last
          ? last.sender.toString() === me.toString()
          : false,
      };
    };

    const users = await User.find({ _id: { $in: partnerIds } }).select(
      "username avatarImage"
    );
    const userItems = users.map((u) => ({
      _id: u._id,
      name: u.username,
      avatarImage: u.avatarImage,
      isGroup: false,
      ...project(lastByKey.get(u._id.toString())),
    }));

    const groupItems = groups.map((g) => ({
      _id: g._id,
      name: g.name,
      avatarImage: g.avatarImage,
      isGroup: true,
      admin: g.admin,
      participants: g.participants,
      ...project(lastByKey.get(g._id.toString())),
    }));

    res.json([...userItems, ...groupItems]);
  } catch (ex) {
    next(ex);
  }
};