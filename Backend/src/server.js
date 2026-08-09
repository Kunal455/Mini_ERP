const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authroutes");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoutes");
const followUpRoutes = require("./routes/followUpRoutes");
const productRoutes = require("./routes/productRoutes");
const stockRoutes = require("./routes/stockRoutes");
const challanRoutes = require("./routes/challanRoutes");
const adminRoutes = require("./routes/adminRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174","https://mini-erp-gilt-sigma.vercel.app", process.env.FRONTEND_URL],
        credentials: true
    })
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/follow-ups", followUpRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/challans", challanRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/invoices", invoiceRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});