const prisma = require("../config/prisma");

const createInvoice = async (req, res, next) => {
    try {
        const { invoiceNumber, customerId, amount, status, items } = req.body;
        if (!invoiceNumber || !customerId || amount === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newInvoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                customerId: Number(customerId),
                amount: Number(amount),
                status: status || 'PENDING',
                createdById: req.user.id,
                items: {
                    create: items?.map(item => ({
                        productId: Number(item.productId),
                        quantity: Number(item.quantity),
                        unitPrice: Number(item.unitPrice)
                    })) || []
                }
            },
            include: { items: true }
        });

        return res.status(201).json({ success: true, message: "Invoice created", data: newInvoice });
    } catch (error) {
        next(error);
    }
};

const getInvoices = async (req, res, next) => {
    try {
        const invoices = await prisma.invoice.findMany({
            include: { customer: { select: { businessName: true, name: true } }, items: true },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        next(error);
    }
};

const updateInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await prisma.invoice.update({
            where: { id: Number(id) },
            data: { status }
        });
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

const deleteInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.invoice.delete({
            where: { id: Number(id) }
        });
        return res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createInvoice,
    getInvoices,
    updateInvoice,
    deleteInvoice
};
