import dotenv from "dotenv";
import express, { urlencoded } from "express";
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

dotenv.config({
  path: "./.env",
});

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extends: true }))
app.use(cookieParser())

export default app;
