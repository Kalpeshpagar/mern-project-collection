import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { verifyRole } from '../middlewares/role.middleware.js'
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/auth.controller.js'

const authRoute = express.Router()

/**
 *  @description : User register route
 *  @requires : name, email, password
 *  @access : public
 */

authRoute.post('/register', registerUser)

/**
 *  @description : User login route
 *  @requires : email, password
 *  @access : public
 */

authRoute.post('/login', loginUser)

/**
 *  @description : User logout route
 *  @requires : valid accessToken
 *  @access : private
 */

authRoute.post('/logout', verifyJWT, logoutUser)

/**
 *  @description : Access & Refresh token generator route
 *  @requires : valid refreshToken in cookie/body
 *  @access : public
 */

authRoute.post('/refresh-token', refreshAccessToken)


export default authRoute