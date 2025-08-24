import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter";
const app=express();

app.use(cors({
  origin: "http://localhost:3001", // allow your Next.js frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());


app.use("/api/v1",userRouter);
app.listen(8080,()=>{
    console.log(`Server Started on port ${8080}`)
})