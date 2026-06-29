import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// import routes
import authRoute from "./routes/auth.routes.js";
import bookRoute from "./routes/book.routes.js";
import memberRoute from "./routes/member.routes.js";
import transactionRoute from "./routes/transaction.routes.js";

// moute routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/books", bookRoute);
app.use("/api/v1/members", memberRoute);
app.use("/api/v1/transactions", transactionRoute);

export default app;
