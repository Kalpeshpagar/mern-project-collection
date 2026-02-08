import jwt from "jsonwebtoken"

const protect = async (req, res, next) => {
    const token = req.cookies.accessToken
    if(!token) return res.json({message:"Not Authorized"})
    try {
        const decode = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        req.user = decode

        next()
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

export default protect