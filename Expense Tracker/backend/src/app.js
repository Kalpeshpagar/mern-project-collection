import express from "express";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import expenseRouter from "./routes/expense.routes.js";

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/v1/users", authRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/expenses", expenseRouter);


export default app;
