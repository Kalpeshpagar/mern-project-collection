import express from 'express'
import { login, logout, refreshToken, register } from '../controllers/auth.controller.js'
import protect from '../middlewares/auth.middleware.js'

const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', protect, logout)
authRouter.post('/refreshToken', refreshToken)

export default authRouter