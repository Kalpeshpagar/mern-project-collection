import mongoose from "mongoose";

async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined in .env");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(`${process.env.MONGO_URI}/LMS`);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
}

export default connectDB;