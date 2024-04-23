import express from "express";
import * as UserController from "../controllers/userController.js";

const userRouter = express.Router();

//Get all users
userRouter.get("/", UserController.getAllUsers);

//get user by ID
userRouter.get("/:id", UserController.getUserById);

//create a new user
userRouter.post("/", UserController.createUser);

//login
userRouter.post("/login", UserController.login);

export default userRouter;
