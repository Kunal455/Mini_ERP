const prisma = require("../config/prisma");

const getDashboard = async (req, res, next) => {
    try {
        const [
            totalUsers, activeUsers,
            totalCustomers, activeCustomers,
            totalProducts, activeProducts,
            lowStockProducts,
            draftChallans, confirmedChallans, cancelledChallans
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isActive: true } }),
            
            prisma.customer.count(),
            prisma.customer.count({ where: { status: 'ACTIVE' } }),
            
            prisma.product.count(),
            prisma.product.count({ where: { isActive: true } }),
            
            // Raw query equivalent logic for low stock can't be done directly with Prisma aggregate in a single pass easily if comparing columns, but minimumStock is a field. 
            // In Prisma, comparing two columns in the same table requires a workaround or raw query. 
            prisma.$queryRaw`SELECT COUNT(*) as count FROM Product WHERE currentStock <= minimumStock AND isActive = true`,
            
            prisma.challan.count({ where: { status: 'DRAFT' } }),
            prisma.challan.count({ where: { status: 'CONFIRMED' } }),
            prisma.challan.count({ where: { status: 'CANCELLED' } })
        ]);

        const lowStockCount = Number(lowStockProducts[0]?.count || 0);

        const recentChallans = await prisma.challan.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { customer: { select: { name: true, businessName: true } } }
        });

        const recentMovements = await prisma.stockMovement.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { product: { select: { name: true, sku: true } } }
        });

        const upcomingFollowUps = await prisma.followUp.findMany({
            take: 5,
            where: { followUpDate: { gte: new Date() } },
            orderBy: { followUpDate: 'asc' },
            include: { customer: { select: { name: true, mobile: true } } }
        });

        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data: {
                statistics: {
                    users: { total: totalUsers, active: activeUsers },
                    customers: { total: totalCustomers, active: activeCustomers },
                    products: { total: totalProducts, active: activeProducts, lowStock: lowStockCount },
                    challans: { draft: draftChallans, confirmed: confirmedChallans, cancelled: cancelledChallans }
                },
                recentChallans,
                recentMovements,
                upcomingFollowUps
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboard
};
