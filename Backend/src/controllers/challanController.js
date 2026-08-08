const prisma = require("../config/prisma");
const { generateChallanNumber } = require("../utils/generateChallanNumber");

const createChallan = async (req, res, next) => {
    try {
        const { customerId, items } = req.body;

        if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Valid customerId and items array are required" });
        }

        const customer = await prisma.customer.findUnique({ where: { id: Number(customerId) } });
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        // Validate items and build snapshots
        const challanItemsData = [];
        let totalQuantity = 0;

        for (const item of items) {
            if (!item.productId || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({ success: false, message: "Invalid item data: productId and positive quantity are required" });
            }

            const product = await prisma.product.findUnique({ where: { id: Number(item.productId) } });
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
            }

            challanItemsData.push({
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                unitPrice: product.unitPrice,
                quantity: Number(item.quantity),
                totalPrice: product.unitPrice * Number(item.quantity)
            });

            totalQuantity += Number(item.quantity);
        }

        const newChallan = await prisma.challan.create({
            data: {
                challanNumber: generateChallanNumber(),
                customerId: Number(customerId),
                totalQuantity,
                status: "DRAFT",
                createdById: req.user.id,
                items: {
                    create: challanItemsData
                }
            },
            include: { items: true }
        });

        return res.status(201).json({ success: true, message: "Draft Challan created successfully", data: newChallan });
    } catch (error) {
        next(error);
    }
};

const getChallans = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { status, customerId, search } = req.query;
        const where = {};

        if (status) where.status = status;
        if (customerId) where.customerId = Number(customerId);
        if (search) where.challanNumber = { contains: search };

        const [challans, total] = await Promise.all([
            prisma.challan.findMany({
                where,
                include: { customer: { select: { name: true, businessName: true } }, createdBy: { select: { name: true } } },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.challan.count({ where })
        ]);

        return res.status(200).json({
            success: true,
            message: "Challans fetched successfully",
            data: challans,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        next(error);
    }
};

const getChallanById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const challan = await prisma.challan.findUnique({
            where: { id: Number(id) },
            include: {
                items: true,
                customer: { select: { name: true, businessName: true, mobile: true } },
                createdBy: { select: { name: true } }
            }
        });

        if (!challan) {
            return res.status(404).json({ success: false, message: "Challan not found" });
        }

        return res.status(200).json({ success: true, message: "Challan fetched successfully", data: challan });
    } catch (error) {
        next(error);
    }
};

const updateChallan = async (req, res, next) => {
    try {
        return res.status(400).json({ success: false, message: "Direct challan updates not implemented. Use specific actions like confirm/cancel." });
    } catch (error) {
        next(error);
    }
};

const confirmChallan = async (req, res, next) => {
    try {
        const { id } = req.params;

        const challan = await prisma.challan.findUnique({
            where: { id: Number(id) },
            include: { items: true }
        });

        if (!challan) return res.status(404).json({ success: false, message: "Challan not found" });
        if (challan.status !== "DRAFT") return res.status(400).json({ success: false, message: "Only DRAFT challans can be confirmed" });

        // Verify stock for all items
        for (const item of challan.items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) return res.status(404).json({ success: false, message: `Product ${item.productName} not found` });
            if (product.currentStock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for product ${item.productName} (SKU: ${item.sku})` });
            }
        }

        // Transaction to update all stocks, create movements and confirm challan
        const transactionOperations = [];

        for (const item of challan.items) {
            transactionOperations.push(prisma.product.update({
                where: { id: item.productId },
                data: { currentStock: { decrement: item.quantity } }
            }));

            transactionOperations.push(prisma.stockMovement.create({
                data: {
                    productId: item.productId,
                    quantity: item.quantity,
                    movementType: "OUT",
                    reason: `Sales Challan ${challan.challanNumber}`,
                    createdById: req.user.id
                }
            }));
        }

        transactionOperations.push(prisma.challan.update({
            where: { id: challan.id },
            data: { status: "CONFIRMED" }
        }));

        await prisma.$transaction(transactionOperations);

        return res.status(200).json({ success: true, message: "Challan confirmed successfully. Stock updated." });
    } catch (error) {
        next(error);
    }
};

const cancelChallan = async (req, res, next) => {
    try {
        const { id } = req.params;

        const challan = await prisma.challan.findUnique({ where: { id: Number(id) } });

        if (!challan) return res.status(404).json({ success: false, message: "Challan not found" });
        
        if (challan.status === "CONFIRMED") {
            return res.status(400).json({ success: false, message: "Confirmed challan cannot be cancelled." });
        }
        
        if (challan.status === "CANCELLED") {
            return res.status(400).json({ success: false, message: "Challan is already cancelled." });
        }

        const updatedChallan = await prisma.challan.update({
            where: { id: challan.id },
            data: { status: "CANCELLED" }
        });

        return res.status(200).json({ success: true, message: "Challan cancelled successfully", data: updatedChallan });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createChallan,
    getChallans,
    getChallanById,
    updateChallan,
    confirmChallan,
    cancelChallan
};
