import { WebSocket,WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-comman/config";
import { prisma } from "@repo/db/client";



interface User{
    ws:WebSocket,
    userId:string,
    rooms:string[]
}
const wss=new WebSocketServer({port:8000},()=>{
    console.log("ws server started")
});

const users:User[]=[];

function checkUser(token:string):string|null{
    const decodedToken=jwt.verify(token,JWT_SECRET);
    if(!decodedToken){
        console.log("user not authenticated for ws")
        return null;
    }
    return (decodedToken as jwt.JwtPayload).userId
}

wss.on("connection",function connection(ws,request){
    const url=request.url;
    if(!url){
        return;
    }
    const queryParams=new URLSearchParams(url.split("?")[1]);
    const token=queryParams.get("token")|| "";
    const userId=checkUser(token);
    if(!userId){
        ws.close()
        return;
    }
    users.push({
        userId,
        rooms:[],
        ws
    })

    ws.on("message",async function message(data){
        console.log(" received from client",data)
        const parsedData=JSON.parse(data as unknown as string);


        if(parsedData.type==="join_room"){
            const user=users.find(x=>x.ws===ws)
            user?.rooms.push(parsedData.roomId);
        }
        if(parsedData.type==="leave_room"){
            const user=users.find(x=>x.ws===ws);
            if(!user){
                return;
            }
            user.rooms=user.rooms.filter(x=>x===parsedData.roomId);
        }
        if(parsedData.type=="chat"){
            const roomId=parsedData.roomId;
            const message=parsedData.message;
            await prisma.chat.create({
                data:{
                    roomId,
                    message,
                    userId
                }
            });
            users.forEach(user=>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type:"chat",
                        message:message,
                        roomId
                    }));
                }
            });
        }
    });
});
