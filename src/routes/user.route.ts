import express from "express";
import {getUserData} from "../controller/user.controller";
import userAuth from "../middleware/user.auth.middleware";

const userRouter = express.Router();

userRouter.get("/user-data",userAuth,getUserData);


export default userRouter;