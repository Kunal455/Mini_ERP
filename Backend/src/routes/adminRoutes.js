const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { getDashboard } = require("../controllers/adminController");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"));

router.get("/dashboard", getDashboard);

module.exports = router;
