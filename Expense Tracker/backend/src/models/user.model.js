import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
      // select:false → password will not be returned by default
    },

    refreshToken: {
      type: String
      // used for rotating refresh tokens
    }
  },
  {
    timestamps: true
  }
);

// pre save hook for password hash before storing in DB
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return
    
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash
})

// compare password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}


const User = mongoose.model("User", userSchema);

export default User;
