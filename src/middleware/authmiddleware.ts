import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from "express";

import devenv from 'dotenv'
devenv.config()

const middleware = async (req:Request, res:Response, next:NextFunction) => {
  const { token } = req.cookies
  console.log("token", token)
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Please login to access this resource',
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        req.user = decoded;
        next();

  } catch (error) {
    console.error('JWT Error:', error)
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }
}

export default middleware