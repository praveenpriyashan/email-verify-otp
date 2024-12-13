import express from "express";
import {register, login, logout, sendVerifyOtp, verifyEmail} from "../controller/auth.controller";
import userAuth from "../middleware/user.auth.middleware";

const authRouter=express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp",userAuth,sendVerifyOtp);
authRouter.post("/verify-account",userAuth,verifyEmail);

export default authRouter;