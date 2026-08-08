const prisma = require("../config/prisma");

const createCustomer = async (req, res, next) => {
    try {
        const { name, mobile, email, businessName, gstNumber, customerType, status, address, notes } = req.body;

        if (!name || !mobile || !businessName || !customerType || !status) {
            return res.status(400).json({ success: false, message: "Required fields are missing" });
        }

        const validTypes = ["RETAIL", "WHOLESALE", "DISTRIBUTOR"];
        if (!validTypes.includes(customerType)) {
            return res.status(400).json({ success: false, message: "Invalid customerType" });
        }

        const validStatuses = ["LEAD", "ACTIVE", "INACTIVE"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const newCustomer = await prisma.customer.create({
            data: {
                name,
                mobile,
                email,
                businessName,
                gstNumber,
                customerType,
                status,
                address,
                notes,
                createdById: req.user.id
            }
        });

        return res.status(201).json({ success: true, message: "Customer created successfully", data: newCustomer });
    } catch (error) {
        next(error);
    }
};

const getCustomers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { search, status, customerType } = req.query;

        const where = {};

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { businessName: { contains: search } },
                { mobile: { contains: search } }
            ];
        }

        if (status) {
            where.status = status;
        }

        if (customerType) {
            where.customerType = customerType;
        }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.customer.count({ where })
        ]);

        return res.status(200).json({
            success: true,
            message: "Customers fetched successfully",
            data: customers,
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

const getCustomerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer = await prisma.customer.findUnique({
            where: { id: Number(id) },
            include: {
                followUps: { orderBy: { followUpDate: 'desc' } },
                challans: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        return res.status(200).json({ success: true, message: "Customer fetched successfully", data: customer });
    } catch (error) {
        next(error);
    }
};

const updateCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, mobile, email, businessName, gstNumber, customerType, status, address, notes } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (mobile) updateData.mobile = mobile;
        if (email !== undefined) updateData.email = email;
        if (businessName) updateData.businessName = businessName;
        if (gstNumber !== undefined) updateData.gstNumber = gstNumber;
        if (customerType) updateData.customerType = customerType;
        if (status) updateData.status = status;
        if (address !== undefined) updateData.address = address;
        if (notes !== undefined) updateData.notes = notes;

        const updatedCustomer = await prisma.customer.update({
            where: { id: Number(id) },
            data: updateData
        });

        return res.status(200).json({ success: true, message: "Customer updated successfully", data: updatedCustomer });
    } catch (error) {
        next(error);
    }
};

const deleteCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Ensure customer exists
        const customer = await prisma.customer.findUnique({ where: { id: Number(id) } });
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        await prisma.customer.delete({
            where: { id: Number(id) }
        });

        return res.status(200).json({ success: true, message: "Customer deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};
