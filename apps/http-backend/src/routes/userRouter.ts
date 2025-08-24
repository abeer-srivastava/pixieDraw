import express from "express";
import {CreateUserSchema,getUserSchema,roomSchema} from "@repo/comman/types";
import jwt  from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-comman/config";
import { authMiddleware } from "../middleware/authMiddleware";
import {prisma} from "@repo/db/client"
import bcrypt from "bcrypt";

declare global{
    namespace Express{
        interface Request{
               userId:string
        }
    }
}
const router = express.Router();


router.get("/",(req,res)=>{
    return res.json({
        message:"PING"
    })
})

router.post("/signup",async (req,res)=>{
   try {
     const body=req.body;
     const parsedData=CreateUserSchema.safeParse(body);
     if(!parsedData.success){
        console.log(parsedData.error);
        return res.status(403).json({
             message:"Incorrect Inputs"
        });
    }
     // db call and hashing the password 
    const hashedPassword=await bcrypt.hash(parsedData.data.password,10);
    const createdUser=await prisma.user.create({
        data:{
            name:parsedData.data.name,
            password:hashedPassword,
            email:parsedData.data.email
        }
    });
    if(!createdUser){
        return res.status(403).json({
            message:"User already exist"
        });
    }
    return res.json({
        message:"User Signed Up",
        userId:createdUser.id
    });
   } catch (error) {
    console.log(error);
    return res.status(400).json({
        message:"Error During SignUp"
    });

   }
})

router.post("/signin",async(req,res)=>{
    // parsing the signin data
    const parsedData=getUserSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.status(411).json({
            message:"User not parsed for signin"
        });
    }
   try {
    const existingUser=await prisma.user.findFirst({
        where:{
            email:parsedData.data.email
         }
     });
     if(!existingUser){
         return res.status(404).json({
             message:"User not found"
         });
     }
    const hashedPasswordComparision=bcrypt.compare(parsedData.data.password,existingUser.password);
    if(!hashedPasswordComparision){
         return res.status(403).json({
             message:"Password not correct"
         });
    }
    const userId=existingUser.id;
    const token=jwt.sign({userId},JWT_SECRET);
 
    return res.status(201).json({
        message:"User signed In",
        token
    });
   } catch (error) {
    console.log("Error Occured during signin",error);
    return res.status(411).json({
        message:"Error during sign In"
    });
   }
});

router.post("/room",authMiddleware,async (req,res)=>{
try {
        const parsedData=roomSchema.safeParse(req.body);
        if(!parsedData.success){
            console.log("error occured in room creation",parsedData.error);
            return res.status(403).json({
                message:"error occured during during room creation "
            });
        }

        const userId=req.userId;
        if(!userId){
            return res.status(404).json({
                message:"User not Authenticated"
            });
        }

        const room =await prisma.room.create({
            data:{
                slug:parsedData.data.roomName,
                adminId:userId
            }
        });
        return res.status(201).json({
            message:"Room created",
            id:room.id
        });
    }catch (error) {
       console.log("Room already existed with this name");
        return res.status(411).json({
            message:"Room already existed with this name"
        }); 
    }
});


router.get("/chats/:roomId",async (req,res)=>{
    const roomId=Number(req.params.roomId);
    console.log("heloooooooooooooooooooo",roomId);
    try {
        const messages=await prisma.chat.findMany({
            where:{
                roomId
            },
            orderBy:{
                id:"desc"
            },
            take:50
        });
        res.status(200).json({
            messages
        });
    } catch (error) {
     console.log("fetching in the error",error);   
    }
});

router.get("/room/:slug",async (req,res)=>{
    const slug=req.params.slug;
    const room=prisma.room.findFirst({
        where:{
            slug
        }
    });
    if(!room){
        return res.status(404).json({
            message:"Slug not found"
        });
    }
    return res.status(201).json({
        message:"slug found",
        room
    });
})




export default router;