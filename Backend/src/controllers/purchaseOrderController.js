const prisma = require("../config/prisma");

const createPurchaseOrder = async (req, res, next) => {
    try {
        const { poNumber, supplier, amount, status, items } = req.body;
        if (!poNumber || !supplier || amount === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
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
