const prisma = require("../config/prisma");

const getAllFollowUps = async (req, res, next) => {
    try {
        const followUps = await prisma.followUp.findMany({
            include: { customer: { select: { name: true, businessName: true } } },
            orderBy: { followUpDate: 'asc' }
        });
        return res.status(200).json({ success: true, data: followUps });
    } catch (error) {
        next(error);
    }
};

const createFollowUp = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const { note, followUpDate } = req.body;

        if (!note || !followUpDate) {
            return res.status(400).json({ success: false, message: "note and followUpDate are required" });
        }

        const customer = await prisma.customer.findUnique({ where: { id: Number(customerId) } });
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const newFollowUp = await prisma.followUp.create({
            data: {
                customerId: Number(customerId),
                note,
                followUpDate: new Date(followUpDate),
                createdById: req.user.id
            }
        });

        // Optionally update the customer's next followUpDate
        await prisma.customer.update({
            where: { id: Number(customerId) },
            data: { followUpDate: new Date(followUpDate) }
        });

        return res.status(201).json({ success: true, message: "Follow-up created successfully", data: newFollowUp });
    } catch (error) {
        next(error);
    }
};

const getFollowUps = async (req, res, next) => {
    try {
        const { customerId } = req.params;

        const followUps = await prisma.followUp.findMany({
            where: { customerId: Number(customerId) },
            orderBy: { followUpDate: 'desc' }
        });

        return res.status(200).json({ success: true, message: "Follow-ups fetched successfully", data: followUps });
    } catch (error) {
        next(error);
    }
};

const updateFollowUp = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { note, followUpDate } = req.body;

        const updateData = {};
        if (note) updateData.note = note;
        if (followUpDate) updateData.followUpDate = new Date(followUpDate);

        const updatedFollowUp = await prisma.followUp.update({
            where: { id: Number(id) },
            data: updateData
        });

        if (followUpDate) {
            await prisma.customer.update({
                where: { id: updatedFollowUp.customerId },
                data: { followUpDate: new Date(followUpDate) }
            });
        }

        return res.status(200).json({ success: true, message: "Follow-up updated successfully", data: updatedFollowUp });
    } catch (error) {
        next(error);
    }
};

const deleteFollowUp = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.followUp.delete({
            where: { id: Number(id) }
        });

        return res.status(200).json({ success: true, message: "Follow-up deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllFollowUps,
    createFollowUp,
    getFollowUps,
    updateFollowUp,
    deleteFollowUp
};
