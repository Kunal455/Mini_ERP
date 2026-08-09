const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createChallan, getChallans, getChallanById, updateChallan, confirmChallan, cancelChallan } = require("../controllers/challanController");

const router = express.Router();

// ACCOUNTS and WAREHOUSE can view challans
router.get("/", authenticate, authorizeRoles("ADMIN", "SALES", "ACCOUNTS", "WAREHOUSE"), getChallans);
router.get("/:id", authenticate, authorizeRoles("ADMIN", "SALES", "ACCOUNTS", "WAREHOUSE"), getChallanById);

// SALES and ADMIN can manage challans
router.post("/", authenticate, authorizeRoles("ADMIN", "SALES"), createChallan);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "SALES"), updateChallan);
router.patch("/:id/confirm", authenticate, authorizeRoles("ADMIN", "SALES"), confirmChallan);
router.patch("/:id/cancel", authenticate, authorizeRoles("ADMIN", "SALES"), cancelChallan);

module.exports = router;
