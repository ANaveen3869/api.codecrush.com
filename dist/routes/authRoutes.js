import express from "express";
import AuthControllers from "../controllers/authControllers.js";
const authRoutes = express.Router();
const authControllers = new AuthControllers();
authRoutes.post("/sign-up", authControllers.createUserHandlers);
export default authRoutes;
