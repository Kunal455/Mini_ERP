const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createInvoice, getInvoices, updateInvoice, deleteInvoice } = require("../controllers/invoiceController");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN", "SALES", "ACCOUNTS"));

router.get("/", getInvoices);
router.post("/", createInvoice);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);

module.exports = router;
