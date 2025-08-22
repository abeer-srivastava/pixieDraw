import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-comman/config";
const wss=new WebSocketServer({port:8080},()=>{
    console.log("ws server started")
});

wss.on("connection",function connection(ws,request){
    const url=request.url;
    if(!url){
        return;
    }
    const queryParams=new URLSearchParams(url.split("?")[1]);
    const token=queryParams.get("token")|| "";

    const decodedToken=jwt.verify(token,JWT_SECRET);
    if(!decodedToken || !(decodedToken as JwtPayload).user.userId){
        ws.close();
        console.log("user not authenticated for ws")
        return ;
    }

    ws.on("message",function message(data){
        console.log(" received from client",data)
    })
})
