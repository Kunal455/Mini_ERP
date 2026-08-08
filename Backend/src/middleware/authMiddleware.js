const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains id and role
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not authenticated" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorizeRoles
};
