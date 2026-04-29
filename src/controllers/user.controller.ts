import { Request, Response } from "express";

export const getUsers = (req: Request, res:Response)=>{
  try{
    const users = [
        { id:1, uname:"Ritika"},
        {id:2, uname:"Maharjan"}
    ];
    res.status(200).json(users);
  }catch(error){
    res.status(500).json({
        success: false,
        message: "Failed to fetch users" 
    })
  }}

  export const postUsers = (req: Request, res:Response)=>{;
    const user = req.body;
    try{
        if(!user||user.uname){
            return res.status(400).json({
                success: false,
                message: "Name is required"
            })
        }
        res.status(200).json({
                sucess: true,
                message: "Inserted Sucessfully",
                user
            })
    }catch(error){
        res.status(500).json({
            message: "Faile to create user"
        })
    }
  }