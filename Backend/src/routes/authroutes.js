const express = require("express");
const { signup, login, logout, getMe, updateMe } = require("../controllers/authcontroller");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);

module.exports = router;
