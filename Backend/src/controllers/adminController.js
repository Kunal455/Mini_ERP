const prisma = require("../config/prisma");

const getDashboard = async (req, res, next) => {
    try {
        const [
            totalUsers, activeUsers,
            totalCustomers, activeCustomers,
            totalProducts, activeProducts,
            lowStockProducts, lowStockProductsCount,
            draftChallans, confirmedChallans, cancelledChallans
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isActive: true } }),
            
            prisma.customer.count(),
            prisma.customer.count({ where: { status: 'ACTIVE' } }),
            
            prisma.product.count(),
            prisma.product.count({ where: { isActive: true } }),
            
            // Raw query to fetch names of low stock products
            prisma.$queryRaw`SELECT name FROM Product WHERE currentStock <= minimumStock AND isActive = true LIMIT 3`,
            prisma.$queryRaw`SELECT COUNT(*) as count FROM Product WHERE currentStock <= minimumStock AND isActive = true`,
            
            prisma.challan.count({ where: { status: 'DRAFT' } }),
            prisma.challan.count({ where: { status: 'CONFIRMED' } }),
            prisma.challan.count({ where: { status: 'CANCELLED' } })
        ]);

        const lowStockNames = lowStockProducts.map(p => p.name);
        const lowStockCount = Number(lowStockProductsCount[0]?.count || 0);

        const recentChallansRaw = await prisma.challan.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { 
                customer: { select: { name: true, businessName: true } },
                items: { select: { totalPrice: true } }
            }
        });

        // Compute total amount for each challan
        const recentChallans = recentChallansRaw.map(challan => ({
            ...challan,
            amount: challan.items.reduce((sum, item) => sum + item.totalPrice, 0)
        }));

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
                    products: { total: totalProducts, active: activeProducts, lowStock: lowStockCount, lowStockNames },
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
