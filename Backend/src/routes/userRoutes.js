const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createUser, getUsers, getUserById, updateUser, updateUserStatus } = require("../controllers/userController");

const router = express.Router();

// Only ADMIN can access user management routes
router.use(authenticate, authorizeRoles("ADMIN"));

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.patch("/:id/status", updateUserStatus);

module.exports = router;
