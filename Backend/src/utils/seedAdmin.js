const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");

const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "kk6547015@gmail.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
        const adminName = process.env.ADMIN_NAME || "System Admin";

        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (!existingAdmin) {
            console.log("No admin found in database. Creating default admin...");
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await prisma.user.create({
                data: {
                    name: adminName,
                    email: adminEmail,
                    password: hashedPassword,
                    role: "ADMIN",
                    isActive: true
                }
            });
            console.log(`Default admin created with email: ${adminEmail}`);
        } else {
            console.log("Admin user already exists. Skipping seed.");
        }
    } catch (error) {
        console.error("Error seeding admin user:", error);
    }
};

module.exports = seedAdmin;
