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
    try {
        const decodedToken=jwt.verify(token,JWT_SECRET);
        if(!decodedToken){
            console.log("user not authenticated for ws")
            return null;
        }
        return (decodedToken as jwt.JwtPayload).userId
    } catch (error) {
        console.log("token not found in the ws server ");
        return null;
    }
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
        // console.log("control reacted here mf",data);
        // console.log("type of data",typeof data);
        let parsedData;
        if(typeof data!=="string"){
            // console.log("parsed data is not string ig");
            parsedData=JSON.parse(data.toString());
        }else{
            // console.log("parsed Data is string ig");
            parsedData=JSON.parse(data);
        }
        // console.log("proper parsed data is ",parsedData);

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
            // console.log("parsedData",parsedData);
            const roomId=Number(parsedData.roomId);
            // console.log("roomId",roomId)
            const message=parsedData.message;
            // console.log("message",message)

            await prisma.chat.create({
                data:{
                    roomId,
                    message:JSON.stringify(parsedData.message),
                    userId
                }
            });
            users.forEach(user=>{
                if(user.rooms.includes(String(roomId))){
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
