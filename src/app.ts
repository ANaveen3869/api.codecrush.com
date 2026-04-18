import express, { Response } from "express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import sendResponse from "./utils/sendResponse.js";


const app = express();
app.use(express.json())


app.get("/" , (_ , res : Response)=>{
    return sendResponse(res , 200 , "Server is up and running");
})

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

export default app;