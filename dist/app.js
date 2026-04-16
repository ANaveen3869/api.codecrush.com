import express from "express";
import authRoutes from "./routes/authRoutes.js";
import sendResponse from "./utils/sendResponse.js";
const app = express();
app.use(express.json());
app.get("/", (_, res) => {
    sendResponse(res, 200, "Server is up and running");
});
app.use("/auth", authRoutes);
export default app;
