const {
  login,
  register,
  setAvatar,
  getAllUsers,
  getNewChatUsers,
} = require("../controllers/userController");
const validateObjectId = require("../middleware/validateObjects");
const router = require("express").Router();

router.post("/login", login);
router.post("/register", register);
router.post("/setAvatar/:id", setAvatar);
router.get("/allusers/:id", validateObjectId, getAllUsers);
router.get("/newchatusers/:id", validateObjectId, getNewChatUsers);

module.exports = router;