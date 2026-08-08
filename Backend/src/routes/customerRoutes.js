const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer } = require("../controllers/customerController");

const { createFollowUp, getFollowUps } = require("../controllers/followUpController");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN", "SALES"));

// Routes accessible by ADMIN and SALES
router.post("/", createCustomer);
router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);

router.post("/:customerId/followups", createFollowUp);
router.get("/:customerId/followups", getFollowUps);

// Restrict deletion to ADMIN only
router.delete("/:id", authorizeRoles("ADMIN"), deleteCustomer);

module.exports = router;
