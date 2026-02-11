import express from 'express'
import { login, logout, refreshToken, register } from '../controllers/auth.controller.js'
import protect from '../middlewares/auth.middleware.js'
import validate from '../middlewares/validate.middleware.js'
import { loginSchema, registerSchema } from '../validations/auth.validation.js'


const authRouter = express.Router()

authRouter.post('/register', validate(registerSchema), register)
authRouter.post('/login', validate(loginSchema), login)
authRouter.post('/logout', protect, logout)
authRouter.post('/refreshToken', refreshToken)

export default authRouter