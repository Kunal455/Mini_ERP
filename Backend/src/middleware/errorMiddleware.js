const errorHandler = (err, req, res, next) => {
    console.error("Error occurred:", err);
    
    // Prisma unique constraint violation
    if (err.code === 'P2002') {
        return res.status(409).json({ success: false, message: "Resource already exists. Duplicate value." });
    }

    // Prisma record not found
    if (err.code === 'P2025') {
        return res.status(404).json({ success: false, message: "Resource not found." });
    }

    return res.status(500).json({ success: false, message: "Internal Server Error" });
};

module.exports = {
    errorHandler
};
