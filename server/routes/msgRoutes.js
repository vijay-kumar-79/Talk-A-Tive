const {getMessages, addMessage} = require("../controllers/msgController");
const router = require("express").Router();

router.post("/getmsg", getMessages);
router.post("/addmsg", addMessage); 

module.exports = router;