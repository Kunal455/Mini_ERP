const prisma = require("../config/prisma");

const createProduct = async (req, res, next) => {
    try {
        const { name, sku, category, unitPrice, currentStock, minimumStock, warehouseLocation } = req.body;

        if (!name || !sku || !category || unitPrice === undefined || currentStock === undefined || minimumStock === undefined) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }

        if (unitPrice < 0 || currentStock < 0 || minimumStock < 0) {
            return res.status(400).json({ success: false, message: "Values cannot be negative" });
        }

        const existingProduct = await prisma.product.findUnique({ where: { sku } });
        if (existingProduct) {
            return res.status(409).json({ success: false, message: "SKU already exists" });
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                sku,
                category,
                unitPrice: Number(unitPrice),
                currentStock: Number(currentStock),
                minimumStock: Number(minimumStock),
                warehouseLocation
            }
        });

        return res.status(201).json({ success: true, message: "Product created successfully", data: newProduct });
    } catch (error) {
        next(error);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { search, category, lowStock } = req.query;

        const where = {};

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { sku: { contains: search } }
            ];
        }

        if (category) {
            where.category = category;
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        let filteredProducts = products;
        
        if (lowStock === 'true') {
            filteredProducts = products.filter(p => p.currentStock <= p.minimumStock);
        }

        const total = filteredProducts.length;
        const paginatedProducts = filteredProducts.slice(skip, skip + limit);

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: paginatedProducts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: Number(id) }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.status(200).json({ success: true, message: "Product fetched successfully", data: product });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, sku, category, unitPrice, minimumStock, warehouseLocation } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (sku) updateData.sku = sku;
        if (category) updateData.category = category;
        if (unitPrice !== undefined) {
            if (unitPrice < 0) return res.status(400).json({ success: false, message: "Unit price cannot be negative" });
            updateData.unitPrice = Number(unitPrice);
        }
        if (minimumStock !== undefined) {
            if (minimumStock < 0) return res.status(400).json({ success: false, message: "Minimum stock cannot be negative" });
            updateData.minimumStock = Number(minimumStock);
        }
        if (warehouseLocation !== undefined) updateData.warehouseLocation = warehouseLocation;

        const updatedProduct = await prisma.product.update({
            where: { id: Number(id) },
            data: updateData
        });

        return res.status(200).json({ success: true, message: "Product updated successfully", data: updatedProduct });
    } catch (error) {
        next(error);
    }
};

const updateProductStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ success: false, message: "isActive flag must be a boolean" });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: Number(id) },
            data: { isActive }
        });

        return res.status(200).json({ success: true, message: "Product status updated successfully", data: updatedProduct });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({
            where: { id: Number(id) }
        });
        return res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    updateProductStatus,
    deleteProduct
};
