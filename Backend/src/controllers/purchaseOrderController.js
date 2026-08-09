const prisma = require("../config/prisma");

const createPurchaseOrder = async (req, res, next) => {
    try {
        // Map frontend fields (supplierName, totalAmount) to backend schema (supplier, amount)
        const supplier = req.body.supplier || req.body.supplierName;
        const amount = req.body.amount !== undefined ? req.body.amount : req.body.totalAmount;
        const { status, items } = req.body;
        
        let poNumber = req.body.poNumber;

        if (!supplier || amount === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields: supplier and amount are required." });
        }

        if (!poNumber) {
            // Generate a PO number automatically if not provided
            poNumber = `PO-${Date.now()}`;
        }

        const newPO = await prisma.purchaseOrder.create({
            data: {
                poNumber,
                supplier,
                amount: Number(amount),
                status: status || 'PENDING',
                createdById: req.user.id,
                items: {
                    create: items?.map(item => ({
                        productName: item.productName,
                        quantity: Number(item.quantity),
                        unitPrice: Number(item.unitPrice)
                    })) || []
                }
            },
            include: { items: true }
        });

        return res.status(201).json({ success: true, message: "Purchase Order created", data: newPO });
    } catch (error) {
        next(error);
    }
};

const getPurchaseOrders = async (req, res, next) => {
    try {
        const pos = await prisma.purchaseOrder.findMany({
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({ success: true, data: pos });
    } catch (error) {
        next(error);
    }
};

const updatePurchaseOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await prisma.purchaseOrder.update({
            where: { id: Number(id) },
            data: { status }
        });
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

const deletePurchaseOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.purchaseOrder.delete({
            where: { id: Number(id) }
        });
        return res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPurchaseOrder,
    getPurchaseOrders,
    updatePurchaseOrder,
    deletePurchaseOrder
};
