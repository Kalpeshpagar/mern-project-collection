import mongoose from "mongoose";

const connectDB = () => {
    const uri = process.env.MONGO_URI.endsWith('/') 
        ? `${process.env.MONGO_URI}expense-tracker` 
        : `${process.env.MONGO_URI}/expense-tracker`;
    mongoose.connect(uri)
        .then(() => console.log("Server connect to database successfully"))
        .catch((error) => {
            console.log("MongoDB connection error", error)
            process.exit(1)
        })
}

export default connectDB