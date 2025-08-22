import express from "express";
import {z} from  "zod";
import { validateUser } from "../middleware/validate";
import {CreateUserSchema} from "@repo/comman/types"
import { getUserSignInSchema } from "@repo/comman/types";
import { roomSchema } from "@repo/comman/types";
import { AnyZodObject } from "zod/v3";
import jwt  from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-comman/config";
import { authMiddleware } from "../middleware/authMiddleware";

type signupSchemaType = z.infer<typeof CreateUserSchema>

const router = express.Router();




router.post("/signup",(req,res)=>{
    const body=req.body;
    const data=CreateUserSchema.safeParse(body);
    if(!data.success){
        return res.status(403).json({
            message:"Incorrect Inputs"
        });
    }
    // db call
    return res.json({
        message:"working fine with signup"
    })
})

router.post("/signin",(req,res)=>{
    const {email,username,password}=req.body;


    const userId="";
// chech when something breaks
    const token=jwt.sign({userId},JWT_SECRET);
    res.json({
        message:"user Signed in",
        token:token
    });

})

router.post("/room",authMiddleware,(req,res)=>{
    const {email,username,password}=req.body;

    return res.json({
        message:"Room Created"
    });
})


export default router;