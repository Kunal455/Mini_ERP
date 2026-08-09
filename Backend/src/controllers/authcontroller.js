const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const authCookieOptions = {
    httpOnly: true,
    secure: true, // Required for cross-site cookies
    sameSite: "none" // Required for Vercel -> Render communication
};

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userCount = await prisma.user.count();
        const assignedRole = userCount === 0 ? "ADMIN" : "SALES";

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: assignedRole
            }
        });

        const { password: _, ...userWithoutPassword } = newUser;

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: userWithoutPassword
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Account is inactive" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const payload = {
            id: user.id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie("token", token, {
            ...authCookieOptions,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        const { password: _, ...userWithoutPassword } = user;

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: userWithoutPassword
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const logout = async (req, res) => {
    res.clearCookie("token", {
        ...authCookieOptions
    });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
};

const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const { password, ...userWithoutPassword } = user;
        return res.status(200).json({ success: true, data: userWithoutPassword });
    } catch (error) {
        console.error("GetMe error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const updateMe = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Name is required" });

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { name }
        });

        const { password, ...userWithoutPassword } = updatedUser;
        return res.status(200).json({ success: true, data: userWithoutPassword });
    } catch (error) {
        console.error("UpdateMe error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    signup,
    login,
    logout,
    getMe,
    updateMe
};
