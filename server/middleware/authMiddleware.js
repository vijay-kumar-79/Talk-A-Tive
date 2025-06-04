const User = require("../models/userModel");

// Simple session verification middleware
const protect = async (req, res, next) => {
  try {
    // Get user ID from headers (you'll send this from frontend)
    const userId = req.headers['user-id'];
    
    if (!userId) {
      console.log("auth no userID")
      return res.status(401).json({ 
        status: false,
        message: "Not authorized, no user ID" 
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log("auth no user with this id")
      return res.status(401).json({ 
        status: false,
        message: "User not found" 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ 
      status: false,
      message: "Server error during authentication" 
    });
  }
};

module.exports = { protect };