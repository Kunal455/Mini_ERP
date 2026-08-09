const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createPurchaseOrder, getPurchaseOrders, updatePurchaseOrder, deletePurchaseOrder } = require("../controllers/purchaseOrderController");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN", "WAREHOUSE"));

router.get("/", getPurchaseOrders);
router.post("/", createPurchaseOrder);
router.put("/:id", updatePurchaseOrder);
router.delete("/:id", deletePurchaseOrder);

module.exports = router;
