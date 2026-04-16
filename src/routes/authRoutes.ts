import express from "express";
import AuthControllers from "../controllers/authControllers.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
const authRoutes = express.Router();

const authControllers = new AuthControllers();

authRoutes.post("/sign-up" ,  authControllers.createUserHandlers)
authRoutes.post("/sign-in" , isAuthenticated ,authControllers.getUserByEmailHandlers)


export default authRoutes;