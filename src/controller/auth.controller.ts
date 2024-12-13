import {NextFunction, Request, Response} from "express";
import validateEnv from "../util/validateEnv";
import createHttpError from "http-errors";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import {transporter} from "../config/nodemailer"
import dotenv from 'dotenv';
import UserModel from "../model/user.model";

import {Document} from 'mongoose';
import {email} from "envalid";

dotenv.config();

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    isAccountVerified: boolean;
    verifyOtp: string;
    verifyOtpExpAt: number;
    resetOtp: string;
    resetOtpExpAt: number;
}

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {name, email, password} = req.body;
    try {
        if (!name || !email || !password) {
            console.log('missing name or email or password');
            throw createHttpError(400, "parameters required");
        }
        console.log('get req body successfully')
        const existUser = await UserModel.findOne({email: email});
        if (existUser) {
            console.log('email already exists');
            throw createHttpError(409, "user already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserModel.create({name, email, password: hashedPassword});
        // res.status(201).json(newUser);
        console.log('user register successful');
        console.log('token create start');
        const tokenPayload = {id: newUser._id};
        const token = jwt.sign(tokenPayload, validateEnv.JWT_SECRET, {expiresIn: '1h'})
        if (!token) {
            console.log('token not created');
            throw createHttpError(500, "internal server error")
        }
        console.log('token create end');
        console.log('cookie create start');
        res.cookie('token', token, {
            httpOnly: true,
            // secure: validateEnv.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production' ? true : false, // In development, set to false
            sameSite: validateEnv.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        console.log('cookie created');
        console.log('preparing  email ');
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'wellcome to my-email-app',
            text: `
            Hi ${name} !
            wellcome to my email app !
            your account has been created by email: ${email}
            `
        }


        console.log('sending email start');
        await transporter.sendMail(mailOption);
        console.log('Email sent successfully');
        res.status(201).json({success: true, user: newUser});
    } catch (e) {
        next(e)
    }
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('in the login function');
    const {email, password} = req.body;

    try {
        if (!email || !password) {
            console.log('missing email or password');
            throw createHttpError(400, 'email or password required');
        }
        const userExist = await UserModel.findOne({email: email});
        if (!userExist) {
            console.log('user not found,enter correct email');
            throw createHttpError(401, "Invalid username or password")
        }
        console.log('user found')
        const passwordMatch: boolean = await bcrypt.compare(password, userExist.password)
        if (!passwordMatch) {
            console.log('password not match,enter correct password');
            throw createHttpError(401, "Invalid username or password")
        }
        console.log('password id correct');
        console.log('token create start');
        const tokenPayload = {id: userExist._id};
        const token = jwt.sign(tokenPayload, validateEnv.JWT_SECRET, {expiresIn: '1h'})
        if (!token) {
            console.log('token not created');
            throw createHttpError(500, "internal server error")
        }
        console.log('token created');
        console.log('cookie create start');
        res.cookie('token', token, {
            httpOnly: true,
            // secure: validateEnv.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production' ? true : false, // In development, set to false
            sameSite: validateEnv.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        console.log('cookie create end');
        res.status(201).json({success: true, userExist});
    } catch (e) {
        next(e)
    }
}

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: validateEnv.NODE_ENV === 'production',
            sameSite: validateEnv.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        res.status(201).json({success: true, message: 'logged out successfully'});
    } catch (e) {
        next(e)
    }
}

export const sendVerifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('start the sent otp function')
    console.log('req.body:', req.body); // Check if the body has the expected data
    console.log('go to the try block')
    try {
        const {userId} = req.body;
        const user = await UserModel.findById(userId) as IUser;
        if (!user) {
            throw createHttpError(404, 'User not found');
            console.log('user not found in sendVerifyOtp function');
        }
        if (user.isAccountVerified) {
            throw createHttpError(404, 'account is already verifying');
            console.log('account is already verifying');
        }
        console.log('start the create otp');
        const otp = String(Math.floor(100000 + Math.random() * 900000))
        user.verifyOtp = otp;
        user.verifyOtpExpAt = Date.now() + 1000 * 60 * 60 * 24;
        console.log('after create otp,ready to user save db');
        await user.save();
        console.log('user saved successfully');
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verify otp',
            text: `
           your verification otp is ${otp}.verify your account using this otp
            `
        }
        console.log('ready to sent otp message via email');
        await transporter.sendMail(mailOption);
        console.log('send the otp message via email');
        res.json({success: true, message: `verification otp sent on ${user.email}`})
    } catch (e) {
        next(e)
    }
}

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {userId, otp} = req.body;
    if (!userId || !otp) {
        throw createHttpError(400, 'missing required details')
        console.log('userId & otp missing in verifyEmail function');
    }
    console.log(`
    userId=${userId}
    otp=${otp}
    `)
    try {
        const user = await UserModel.findById(userId) as IUser;
        if (!user) {
            throw createHttpError(404, 'user not found')
            console.log('user not found in verifyEmail function');
        }
        console.log('get user successfully');
        console.log(`user=${user}`);

        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            throw createHttpError(404, 'invalid otp')
            console.log('invalid otp in verifyEmail function');
        }
        console.log('otp verify without expire date');
        if (user.verifyOtpExpAt < Date.now()) {
            throw createHttpError(404, ' OTP expired')
            console.log('OTP expired in verifyEmail function');
        }
        console.log('successfully verified OTP & ready update user to isAccountVerified=true');
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpAt = 0;
        await user.save()
        console.log('end update user to isAccountVerified=true');
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verified successfully',
            text: `
            Hi ${user.name} wellcome to FOOD CORNER
            Your account has been verified successfully.
            `
        }
        await transporter.sendMail(mailOption);
        console.log('send the otp message via email');
        res.json({success: true, message: `email : ${user.email} verified successfully`})
    } catch (e) {
        next(e)
    }
}

export const isAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
         res.json({success: true});
         console.log('user is authenticated');
    } catch (e) {
        next(e)
    }
}
