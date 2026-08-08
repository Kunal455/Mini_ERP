const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { stockIn, stockOut, getStock, getStockMovements, getProductStockHistory } = require("../controllers/stockController");

const router = express.Router();

// Allow all internal roles to view stock
router.get("/", authenticate, authorizeRoles("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"), getStock);
router.get("/movements", authenticate, authorizeRoles("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"), getStockMovements);

// Restrict stock modifications to Admin and Warehouse
router.post("/in", authenticate, authorizeRoles("ADMIN", "WAREHOUSE"), stockIn);
router.post("/out", authenticate, authorizeRoles("ADMIN", "WAREHOUSE"), stockOut);

module.exports = router;
