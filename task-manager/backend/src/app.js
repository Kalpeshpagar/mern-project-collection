// server ko create krna
// This file is responsible for:
// Creating express app
// Setting middlewares
// Setting routes
// Setting error handler
// Exporting the app
import express from "express"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js";
const app = express();

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


// routes
app.use('/api/v1', authRouter)

// Health checker
app.get('/', (req, res) => {
    res.send("Hello User")
})


export {app}