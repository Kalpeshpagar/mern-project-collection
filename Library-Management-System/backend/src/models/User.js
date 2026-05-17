import mongoose from 'mongoose'
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique:true,
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['admin', 'librarian', 'member'],
        default: 'member',
    },
    phone: {
        type:String,
    },
    address: {
        type:String,
    },
    avatar: {
        type:String,
    },
    isActive: {
        type: Boolean,
        default:true,
    },
    membershipId: {
        type:String
    },
    borrowLimit: {
        type: Number,
        default:3
    },
    refreshToken: {
            type: String
    }
    
}, { timestamps: true })


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.method.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.method

export const User = mongoose.model(userSchema, 'User')
