const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createProduct, getProducts, getProductById, updateProduct, updateProductStatus } = require("../controllers/productController");
const { getProductStockHistory } = require("../controllers/stockController");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN", "WAREHOUSE"));

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.patch("/:id/status", updateProductStatus);

router.get("/:id/stock-history", getProductStockHistory);

module.exports = router;
