const express = require("express");
const router = express.Router();
const {
  createGroup,
  addToGroup,
  removeFromGroup,
  getUserGroups
} = require("../controllers/grpController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createGroup);
router.post("/add", protect, addToGroup);
router.post("/remove", protect, removeFromGroup);
router.get("/user", protect, getUserGroups);

module.exports = router;