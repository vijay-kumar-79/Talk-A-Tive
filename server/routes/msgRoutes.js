const express = require("express");
const router = express.Router();
const { getMessages, addMessage } = require("../controllers/msgController");
const upload = require("../middleware/upload");

// No authentication middleware needed
router.post("/getmsg", getMessages);
router.post("/addmsg", upload.single('image'), addMessage);

module.exports = router;