const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { updateFollowUp, deleteFollowUp, getAllFollowUps } = require("../controllers/followUpController");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN", "SALES"));

router.get("/", getAllFollowUps);
router.put("/:id", updateFollowUp);
router.delete("/:id", deleteFollowUp);

module.exports = router;
