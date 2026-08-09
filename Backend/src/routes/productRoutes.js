const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createProduct, getProducts, getProductById, updateProduct, updateProductStatus, deleteProduct } = require("../controllers/productController");
const { getProductStockHistory } = require("../controllers/stockController");

const router = express.Router();

// Allow all internal roles to view products
router.get("/", authenticate, authorizeRoles("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"), getProducts);
router.get("/:id", authenticate, authorizeRoles("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"), getProductById);
router.get("/:id/stock-history", authenticate, authorizeRoles("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"), getProductStockHistory);

// Restrict product modifications to Admin and Warehouse
router.post("/", authenticate, authorizeRoles("ADMIN", "WAREHOUSE"), createProduct);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "WAREHOUSE"), updateProduct);
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN", "WAREHOUSE"), updateProductStatus);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteProduct);

module.exports = router;
