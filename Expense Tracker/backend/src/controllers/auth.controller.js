import User from "../models/user.model.js"
import jwt from "jsonwebtoken"

const createAccessToken = (user) => {
    return jwt.sign({ _id: user._id },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION }
    )
}

const createRefreshToken = (user) => {
    return jwt.sign({ _id: user._id, email: user.email },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION }
    )
}

const register = async (req, res) => {
    const { name, email, password } = req.body

    try {
        const exists = await User.findOne({ email })
        if (exists) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            })
        }

        const user = await User.create({
            name,
            email,
            password
        })

        const accessToken = createAccessToken(user)
        const refreshToken = createRefreshToken(user)

        user.refreshToken = refreshToken
        await user.save()

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        })
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || "User is not register"
        })
    }
}

const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email }).select("+password")
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid email or password"

            })
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"

            })
        }

        const accessToken = createAccessToken(user)
        const refreshToken = createRefreshToken(user)

        user.refreshToken = refreshToken
        await user.save()

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        })
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.json({ success: true });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "User is not login" })
    }
}

const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            refreshToken: null
        })

        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")

        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken
    if (!token) {
        return res.status(401).json({ message: "No refresh token" })
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET)
        const user = await User.findById(decode._id)

        if (!user || user.refreshToken !== token) {
            return res.status(403).json({ message: "Invalid refresh token" })
        }

        const newAccessToken = createAccessToken(user)

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        })

        res.json({ success: true })
    } catch {
        res.status(403).json({
            message: "Refresh token expired. Please login again."
        })
    }
}


export { register, login, logout, refreshToken }