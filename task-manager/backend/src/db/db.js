import mongoose from "mongoose"

const connectDB =  () => {
    mongoose.connect(`${process.env.DATABASE_URL}/taskManager`)
        .then(() => console.log("DB Connected Successfully"))
        .catch((error) => {
            console.error("Failed to connect DB ", error);
            process.exit(1)
    })
}

export default connectDB