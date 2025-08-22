// this is the middleware to validate the schemas of the signup and signin ep

import { NextFunction, Request, Response } from "express"
import {z} from "zod"
import { AnyZodObject } from "zod/v3"

export const validateUser=(schema:AnyZodObject)=>(req:Request,res:Response,next:NextFunction)=>{
    const success=schema.safeParse(req.body);
    if(!success){
        return res.status(403).json({
            message:"Error in the validation middleware"
        });
    }
    next();
}