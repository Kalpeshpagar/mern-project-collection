import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = 4000 || process.env.PORT;

// connect database
connectDB();

app.listen(PORT, () => {
  console.log(`⚙️ Server is running at port : ${PORT}`);
});
