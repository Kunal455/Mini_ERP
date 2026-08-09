const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createInvoice, getInvoices, updateInvoice, deleteInvoice } = require("../controllers/invoiceController");

const router = express.Router();

router.use(authenticate);

// All roles that can access invoices can view them
router.get("/", authorizeRoles("ADMIN", "SALES", "ACCOUNTS"), getInvoices);

// Only ADMIN and ACCOUNTS can manage invoices
router.post("/", authorizeRoles("ADMIN", "ACCOUNTS"), createInvoice);
router.put("/:id", authorizeRoles("ADMIN", "ACCOUNTS"), updateInvoice);
router.delete("/:id", authorizeRoles("ADMIN", "ACCOUNTS"), deleteInvoice);

module.exports = router;
