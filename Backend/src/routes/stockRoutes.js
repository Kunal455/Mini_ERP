const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { stockIn, stockOut, getStock, getStockMovements, getProductStockHistory } = require("../controllers/stockController");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN", "WAREHOUSE"));

router.post("/in", stockIn);
router.post("/out", stockOut);
router.get("/", getStock);
router.get("/movements", getStockMovements);

module.exports = router;
