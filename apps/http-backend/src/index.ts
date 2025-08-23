import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter";
const app=express();

app.use(cors());
app.use(express.json());


app.use("/api/v1",userRouter);
app.listen(8080,()=>{
    console.log(`Server Started on port ${8080}`)
})