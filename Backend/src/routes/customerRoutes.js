const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer } = require("../controllers/customerController");

const { createFollowUp, getFollowUps } = require("../controllers/followUpController");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN", "SALES"));

router.post("/", createCustomer);
router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

router.post("/:customerId/followups", createFollowUp);
router.get("/:customerId/followups", getFollowUps);

module.exports = router;
