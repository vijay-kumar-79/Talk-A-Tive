const mongoose = require("mongoose");
const Group = require("../models/grpModel");
const User = require("../models/userModel");

// In createGroup controller
module.exports.createGroup = async (req, res, next) => {
  try {
    const { name, participants } = req.body;
    const admin = req.user._id; // This should be a valid ObjectId

    // Convert string IDs to ObjectIds if needed
    const participantIds = participants.map((id) =>
      new mongoose.Types.ObjectId(id)
    );

    const group = await Group.create({
      name,
      admin: new mongoose.Types.ObjectId(admin),
      participants: [...participantIds, new mongoose.Types.ObjectId(admin)],
    });

    // Populate the data before returning
    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "username avatarImage")
      .populate("participants", "username avatarImage");

    res.status(201).json({
      status: true,
      group: populatedGroup,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.addToGroup = async (req, res, next) => {
  try {
    const { groupId, userId } = req.body;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { participants: userId } },
      { new: true }
    );

    res.json({
      status: true,
      group,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.removeFromGroup = async (req, res, next) => {
  try {
    const { groupId, userId } = req.body;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { participants: userId } },
      { new: true }
    );

    res.json({
      status: true,
      group,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getUserGroups = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({
      participants: userId,
    }).populate("participants", "username avatarImage");

    res.json(groups);
  } catch (ex) {
    next(ex);
  }
};
