import dotenv from "dotenv";
dotenv.config({ path: "./.env" });   

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 4000;  
connectDB();

app.listen(PORT, () => {
  console.log(`⚙️ Server is running at port : ${PORT}`);
});