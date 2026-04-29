import express from 'express'
import {
  registerUser,
  loginUser,
  logoutUser,
  sendVerificationOtp,
  verifyOtp,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
} from '../controllers/authcontroller'
import userAuth from '../middleware/authmiddleware'

const authRouter = express.Router()

authRouter.post('/registerUser', registerUser)
authRouter.post('/loginUser', loginUser)
authRouter.post('/logoutUser', logoutUser)
authRouter.post('/send-verification-otp', sendVerificationOtp)
authRouter.post('/verify-account', verifyOtp)
authRouter.post('/isAuth', userAuth, isAuthenticated)
authRouter.post('/send-reset-otp', sendResetOtp)
authRouter.post('/reset-password', resetPassword)

export default authRouter