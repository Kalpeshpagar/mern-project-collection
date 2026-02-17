import express from "express"
import cookieParser from "cookie-parser";


const app = express()

// middlewares
app.use(express.json())
app.use(cookieParser());

// import routes
import authRouter from "./routes/auth.routes.js"


// use - routes
app.use("/api/v1/users",authRouter)


export default app