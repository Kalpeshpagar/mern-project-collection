import mongoose from "mongoose";

// console.log(process.env.MONGO_URL);
function connectDB() {
  mongoose
    .connect(`${process.env.MONGO_URL}/LMS`)
    .then(() => console.log("database connected successfully"))
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
}

export default connectDB;
