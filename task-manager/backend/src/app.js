// server ko create krna
// This file is responsible for:
// Creating express app
// Setting middlewares
// Setting routes
// Setting error handler
// Exporting the app
import express from "express"

const app = express();

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// routes

// Health checker
app.get('/', (req, res) => {
    res.send("Hello User")
})


export {app}