const express = require("express");
const router = express.Router();
const { getMessages, addMessage, getConversations } = require("../controllers/msgController");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/conversations", getConversations);
router.post("/getmsg", getMessages);
router.post("/addmsg", upload.single("image"), addMessage);

module.exports = router;