import "reflect-metadata"

import * as express from "express"
import { Request, Response } from "express";
import { User } from "#entity/user.entity.js";
import { Reminder } from "#entity/reminder.entity.js";
import { Permission } from "#entity/permission.entity.js";
import { myDataSource } from "#utils/app-data-source.js";

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import transporter from "#config/nodemailer.js";
dotenv.config()

try {
    await myDataSource.initialize()
    console.log("Data Source has been initialized!")
} catch (error) {
    console.error("Error during Data Source initialization:", error)
}

export const registerUser = async (req:Request, res:Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please fill all the fields",
    });
  }

  try {
    const compareEmail = await myDataSource
                        .createQueryBuilder()
                        .select("user")
                        .from(User, "user")
                        .where("user.id = :id", { id: 1 })
                        .getOne()

    if (compareEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await myDataSource
                        .createQueryBuilder()
                        .insert()
                        .into(User)
                        .values({
                        name: name,
                        email: email,
                        password: hashedPassword,
                    })
                    .returning(["id"])
                        .execute()

    const id = user.raw[0].id;

    // send email 
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Registration Confirmation",
      text: `Hi ${name}, your account is created.`,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { id, name, email },
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//LOGIN USER
export const loginUser = async (req:Request, res:Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please fill all the fields",
    });
  }

  try {
    // 1. Get user from DB
    const result = await myDataSource
                    .createQueryBuilder()
                    .select("user")
                    .from(User, "user")
                    .where("user.email = :email", { email: email })
                    .getOne();

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const userId = result.id;

    // 2. Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      result.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // 3. Check if verified
    if (!result.isverified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    // 4. Generate token
    const token = jwt.sign(
      { id: result.id },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // 5. Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

            await myDataSource
            .createQueryBuilder()
            .update(User)
            .set({isloggedin:true})
            .where("email= :email", {email})
            .execute()

    // 6. Send response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data:{token}
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//LOGOUT USER
export const logoutUser = async (req:Request, res:Response) => {
  try {
    const {email}=req.body
    if(!email){
      res.status(400).json({
        success: false,
        message: 'Enter your email',
      })
    }
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })

        await myDataSource
        .createQueryBuilder()
        .update(User)
        .set({isloggedin:false})
        .where("email= :email", {email})
        .execute();

    return res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error logging out user',
    })
  }
}

// Otp Verification
export const sendVerificationOtp = async (req:Request, res:Response) => {
  try {
    const { id } = req.body;


    const result = await myDataSource
                    .createQueryBuilder()
                    .select("user")
                    .from(User,"user")
                    .where("user.id = :id", {id})
                    .getOne()

    console.log(result);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiry = Date.now() + 24 * 60 * 60 * 1000;

            await myDataSource
            .createQueryBuilder()
            .update(User)
            .set({
                verifyotp: otp,
                verifyotpexpiry: expiry,
            })
            .where("id=:id", {id})
            .execute();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: result.email,
      subject: 'Verification OTP',
      text: `Your verification OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: 'Verification OTP sent successfully',
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//! Otp Verification
export const verifyOtp = async (req:Request, res:Response) => {
  const { id, otp } = req.body
  if (!id || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Missing Details',
    })
  }
  try {
  const result =  await myDataSource
                .createQueryBuilder()
                .select("user")
                .from(User, "user")
                .where("user.id=:id",{id})
                .getOne();

if (!result) {
  return res.status(400).json({
    success: false,
    message: "User not found",
  });
}

    if (!result.verifyotp || result.verifyotp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      })
    }
    if (result.verifyotpexpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP Expired',
      })
    }

  await myDataSource
  .createQueryBuilder()
  .update(User)
  .set({
    isverified: true,
    verifyotp: null,
    verifyotpexpiry: null,
  })
  .where("id = :id", { id })
  .execute();

    return res.json({
      success: true,
      message: 'Account verified successfully',
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying account',
    })
  }
}

//! Check if User is authenticated
export const isAuthenticated = async (req:Request, res:Response) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'User is authenticated',
    })
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    })
  }
}

export const sendResetOtp = async (req:Request, res:Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please enter email",
    });
  }

  try {
    // 1. Check user in DB
     const result = await myDataSource
                   .createQueryBuilder()
                   .select("user")
                   .from(User,"user")
                   .where("user.email=:email", {email})
                   .getOne()

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiry = Date.now() + 15 * 60 * 1000; // 15 min

    // 3. Store OTP in DB
        await myDataSource
        .createQueryBuilder()
        .update(User)
        .set({
            resetotp: otp,
            resetotpexpiry: expiry,
        })
        .where("user.email = :email", { email })
        .execute();

    // 4. Send email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: result.email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//! Reset Password
export const resetPassword = async (req:Request, res:Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please fill all the fields",
    });
  }

  try {
    // 1. Get user from DB
    const result = await myDataSource
        .createQueryBuilder()
        .select("user")
        .from(User, "user")
        .where("user.email = :email", { email })
        .getOne();

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Check OTP
    if (
      !result.resetotp ||
      String(result.resetotp) !== String(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // 3. Check expiry
    if (result.resetotpexpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    // 4. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update DB
    await myDataSource
    .createQueryBuilder()
    .update(User)
    .set({
    password: hashedPassword,
    resetotp: "",
    resetotpexpiry: 0,
  })
  .where("email = :email", { email })
  .execute();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};