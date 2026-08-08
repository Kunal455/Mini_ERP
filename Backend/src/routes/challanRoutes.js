const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createChallan, getChallans, getChallanById, updateChallan, confirmChallan, cancelChallan } = require("../controllers/challanController");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN", "SALES"));

router.post("/", createChallan);
router.get("/", getChallans);
router.get("/:id", getChallanById);
router.put("/:id", updateChallan);
router.patch("/:id/confirm", confirmChallan);
router.patch("/:id/cancel", cancelChallan);

module.exports = router;
