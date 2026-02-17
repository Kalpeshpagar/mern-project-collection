import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { login, logout, refreshToken, register } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";
import validate from "../middlewares/validate.middleware.js";

const router = express.Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.post('/refresh-token', refreshToken)

// secure routes
router.post('/logout', verifyJWT ,logout)


export default router