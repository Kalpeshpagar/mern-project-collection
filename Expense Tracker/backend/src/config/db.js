import mongoose from "mongoose";

const connectDB =  () => {
    mongoose.connect(`${process.env.MONGO_URI}/expense-tracker`)
        .then(() => console.log("Server connect to database successfully"))
        .catch((error) => {
            console.log("MongoDB connection error", error)
            process.exit(1)
        })
}

export default connectDB