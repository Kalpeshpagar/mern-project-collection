import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors    from "cors";
import cookieParser from "cookie-parser";

// ── Route imports ─────────────────────────────────────────────────────────
import authRoute        from "./routes/auth.routes.js";
import bookRoute        from "./routes/book.routes.js";
import memberRoute      from "./routes/member.routes.js";
import transactionRoute from "./routes/transaction.routes.js";
import fineRoute        from "./routes/fine.routes.js";
import authorRoute      from "./routes/author.routes.js";
import categoryRoute    from "./routes/category.routes.js";

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
    origin:      process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/api/v1/auth",         authRoute);
app.use("/api/v1/books",        bookRoute);
app.use("/api/v1/members",      memberRoute);
app.use("/api/v1/transactions", transactionRoute);
app.use("/api/v1/fines",        fineRoute);
app.use("/api/v1/authors",      authorRoute);
app.use("/api/v1/categories",   categoryRoute);

// ── Health check ──────────────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "LMS API is running",
        timestamp: new Date().toISOString(),
    });
});

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// ── Global error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message    = err.message    || "Internal server error";

    // Mongoose validation error
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: Object.values(err.errors).map((e) => e.message).join(", "),
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            success: false,
            message: `${field} already exists`,
        });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Token expired" });
    }

    res.status(statusCode).json({ success: false, message });
});

export default app;