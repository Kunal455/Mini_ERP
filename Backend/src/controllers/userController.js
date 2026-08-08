const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");

const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const validRoles = ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword, role }
        });

        const { password: _, ...userWithoutPassword } = newUser;
        return res.status(201).json({ success: true, message: "User created successfully", data: userWithoutPassword });
    } catch (error) {
        next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true }
        });
        return res.status(200).json({ success: true, message: "Users fetched successfully", data: users });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "User fetched successfully", data: user });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;
        const userId = Number(id);

        if (req.user.id === userId && role && role !== req.user.role) {
            return res.status(400).json({ success: false, message: "You cannot change your own role" });
        }

        const validRoles = ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true }
        });

        return res.status(200).json({ success: true, message: "User updated successfully", data: updatedUser });
    } catch (error) {
        next(error);
    }
};

const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const userId = Number(id);

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ success: false, message: "isActive flag must be a boolean" });
        }

        if (req.user.id === userId && !isActive) {
            return res.status(400).json({ success: false, message: "You cannot deactivate your own account" });
        }

        if (!isActive) {
            const userToDeactivate = await prisma.user.findUnique({ where: { id: userId } });
            if (userToDeactivate && userToDeactivate.role === 'ADMIN') {
                const activeAdminsCount = await prisma.user.count({ where: { role: 'ADMIN', isActive: true } });
                if (activeAdminsCount <= 1) {
                    return res.status(400).json({ success: false, message: "Cannot deactivate the last active ADMIN account" });
                }
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive },
            select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true }
        });

        return res.status(200).json({ success: true, message: "User status updated successfully", data: updatedUser });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    updateUserStatus
};
