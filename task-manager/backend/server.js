// server ko start krna
// This file is responsible for:
// Loading env
// Connecting DB
// Starting server
import dotenv from "dotenv";
dotenv.config();

import { app } from "./src/app.js";
import connectDB from "./src/db/db.js";

const PORT = process.env.PORT || 3000

// connect DB
connectDB()

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
