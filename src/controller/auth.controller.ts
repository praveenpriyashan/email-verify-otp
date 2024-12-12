import {NextFunction, Request, Response} from "express";
import UserModel from "../model/user.model";
import validateEnv from "../util/validateEnv";
import createHttpError from "http-errors";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import {transporter} from "../config/nodemailer"
import dotenv from 'dotenv';

dotenv.config();


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
            secure: validateEnv.NODE_ENV === 'production',
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
            `
        }
        console.log('sending email start');
        try {
            await transporter.sendMail(mailOption);
            console.log('Email sent successfully');
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
        }
        console.log('sending  email end');
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
            secure: validateEnv.NODE_ENV === 'production',
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