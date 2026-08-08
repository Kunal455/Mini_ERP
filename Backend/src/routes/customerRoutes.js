const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer } = require("../controllers/customerController");

const { createFollowUp, getFollowUps } = require("../controllers/followUpController");

const router = express.Router();

// ACCOUNTS can view customers and follow-ups
router.get("/", authenticate, authorizeRoles("ADMIN", "SALES", "ACCOUNTS"), getCustomers);
router.get("/:id", authenticate, authorizeRoles("ADMIN", "SALES", "ACCOUNTS"), getCustomerById);
router.get("/:customerId/followups", authenticate, authorizeRoles("ADMIN", "SALES", "ACCOUNTS"), getFollowUps);

// SALES and ADMIN can create/update customers and follow-ups
router.post("/", authenticate, authorizeRoles("ADMIN", "SALES"), createCustomer);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "SALES"), updateCustomer);
router.post("/:customerId/followups", authenticate, authorizeRoles("ADMIN", "SALES"), createFollowUp);

// Restrict deletion to ADMIN only
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteCustomer);

module.exports = router;
