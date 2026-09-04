const bcrypt = require("bcryptjs");
const User = require("../models/userModel.js");

// Strip the password hash before sending a user document to the client
const safeUser = (user) => {
  const { password, ...rest } = user.toObject();
  return rest;
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used :)", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.json({ status: true, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.json({ msg: "User not found", status: false });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.json({ msg: "Wrong Password, Please try again", status: false });

    res.json({ status: true, user: safeUser(user) });
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

// Users you have NOT yet chatted with (for the New Chat modal)
module.exports.getNewChatUsers = async (req, res, next) => {
  try {
    const Messages = require("../models/msgModel");
    const me = req.params.id;
    const partnerIds = await Messages.distinct("users", {
      isGroup: false,
      users: me,
    });
    const users = await User.find({
      _id: { $ne: me, $nin: partnerIds },
    }).select(["username", "avatarImage", "_id"]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};