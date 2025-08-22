import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter";
const app=express();

app.listen(cors());
app.use(express.json());


app.use("/api/v1",userRouter);
app.listen(8000,()=>{
    console.log("Server Started")
})