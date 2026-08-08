const prisma = require("../config/prisma");

const stockIn = async (req, res, next) => {
    try {
        const { productId, quantity, reason } = req.body;

        if (!productId || quantity === undefined || !reason) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }

        if (quantity <= 0) {
            return res.status(400).json({ success: false, message: "Quantity must be greater than 0" });
        }

        const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Use transaction to ensure data integrity
        const [updatedProduct, stockMovement] = await prisma.$transaction([
            prisma.product.update({
                where: { id: Number(productId) },
                data: { currentStock: { increment: Number(quantity) } }
            }),
            prisma.stockMovement.create({
                data: {
                    productId: Number(productId),
                    quantity: Number(quantity),
                    movementType: "IN",
                    reason,
                    createdById: req.user.id
                }
            })
        ]);

        return res.status(201).json({ success: true, message: "Stock IN successful", data: updatedProduct });
    } catch (error) {
        next(error);
    }
};

const stockOut = async (req, res, next) => {
    try {
        const { productId, quantity, reason } = req.body;

        if (!productId || quantity === undefined || !reason) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }

        if (quantity <= 0) {
            return res.status(400).json({ success: false, message: "Quantity must be greater than 0" });
        }

        const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (product.currentStock < quantity) {
            return res.status(400).json({ success: false, message: "Insufficient stock" });
        }

        // Use transaction
        const [updatedProduct, stockMovement] = await prisma.$transaction([
            prisma.product.update({
                where: { id: Number(productId) },
                data: { currentStock: { decrement: Number(quantity) } }
            }),
            prisma.stockMovement.create({
                data: {
                    productId: Number(productId),
                    quantity: Number(quantity),
                    movementType: "OUT",
                    reason,
                    createdById: req.user.id
                }
            })
        ]);

        return res.status(201).json({ success: true, message: "Stock OUT successful", data: updatedProduct });
    } catch (error) {
        next(error);
    }
};

const getStock = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                select: { id: true, name: true, sku: true, currentStock: true, minimumStock: true, warehouseLocation: true },
                skip,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            prisma.product.count()
        ]);

        return res.status(200).json({
            success: true,
            message: "Stock fetched successfully",
            data: products,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        next(error);
    }
};

const getStockMovements = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { productId, movementType } = req.query;
        const where = {};

        if (productId) where.productId = Number(productId);
        if (movementType) where.movementType = movementType;

        const [movements, total] = await Promise.all([
            prisma.stockMovement.findMany({
                where,
                include: { product: { select: { name: true, sku: true } }, createdBy: { select: { name: true } } },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.stockMovement.count({ where })
        ]);

        return res.status(200).json({
            success: true,
            message: "Stock movements fetched successfully",
            data: movements,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        next(error);
    }
};

const getProductStockHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const where = { productId: Number(id) };

        const [movements, total] = await Promise.all([
            prisma.stockMovement.findMany({
                where,
                include: { createdBy: { select: { name: true } } },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.stockMovement.count({ where })
        ]);

        return res.status(200).json({
            success: true,
            message: "Product stock history fetched successfully",
            data: movements,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    stockIn,
    stockOut,
    getStock,
    getStockMovements,
    getProductStockHistory
};
