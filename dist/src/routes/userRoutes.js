import express from "express";
import UserControllers from "../controllers/userControllers";
import { isAuthenticated } from "../middleware/isAuthenticated";
const userRoutes = express.Router();
const userController = new UserControllers();
userRoutes.patch("/:id", isAuthenticated, userController.updateUserByIdHandlers);
export default userRoutes;
