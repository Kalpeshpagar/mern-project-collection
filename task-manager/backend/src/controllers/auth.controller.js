import User from "../models/user.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const createAccessToken = (user) => {
    return jwt.sign({ id: user._id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "1d" }
    )
}

const createRefreshToken = (user) => {
    return jwt.sign({ id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    )
}

const register = async (req, res) => {
    const { name, email, password, description } = req.body
    try {
        if ([username, email, password].some(field => !field || field.trim() === "")) {
            return res.status(400).json({ message: "All fields are required" });
        }


        const existedUser = await User.findOne({ email })
        if (existedUser) return res.json({ success: false, message: "User already exists" })

        // hashed password
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name,
            email,
            description,
            password: hashedPassword
        });

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        user.refreshToken = refreshToken
        await user.save()

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(201).json({ success: true })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const login = async (req, res) => {
    const { email, password } = req.body
    try {
        if (!email || !password) return res.json({ success: false, message: "All fields are required" })
        
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ success: false, message: "Invalid email" })
        
        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.status(400).json({ success: false, message: "Invalid password" })
        
        const accessToken = createAccessToken(user);
          const refreshToken = createRefreshToken(user);
        
          user.refreshToken = refreshToken;
          await user.save();
        
          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
          });
        
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
          });
        
          res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export { register, login}