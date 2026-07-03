import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import expenseRouter from "./routes/expense.routes.js";

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174"
];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(...process.env.FRONTEND_URL.split(",").map(o => o.trim()));
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

// routes
app.use("/api/v1/users", authRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/expenses", expenseRouter);


export default app;
