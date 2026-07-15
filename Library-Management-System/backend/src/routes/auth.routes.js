import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { verifyRole } from '../middlewares/role.middleware.js'
import { upload } from '../middlewares/upload.middleware.js'
import { changePassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateProfile } from '../controllers/auth.controller.js'

const authRoute = express.Router()

/**
 *  @description : User register route
 *  @requires : name, email, password
 *  @access : public
 */

authRoute.post('/register', upload.fields([{ name: 'avatar', maxCount: 1 }]), registerUser)


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

/**
 *  @description : Get current user profile
 *  @requires : valid user
 *  @access : private
 */

authRoute.get('/me', verifyJWT, getCurrentUser)

/**
 *  @description : Update current user profile
 *  @access : private
 */

authRoute.put('/me', verifyJWT, updateProfile)

/**
 *  @description : Change current user password
 *  @requires : Valid user password required
 *  @access : private
 */

authRoute.put('/change-password',  verifyJWT, changePassword);

export default authRoute