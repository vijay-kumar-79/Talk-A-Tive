const {
  login,
  register,
  logout,
  setAvatar,
  getAllUsers,
} = require("../controllers/userController");
const router = require("express").Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout/:id", logout);
router.post("/setAvatar/:id", setAvatar);
router.get("/allusers/:id", getAllUsers);

module.exports = router;
