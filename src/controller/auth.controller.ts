import {NextFunction, Request, Response} from "express";
import UserModel from "../model/user.model";
import validateEnv from "../util/validateEnv";
import createHttpError from "http-errors";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    const {name, email, password} = req.body;

    try {
        if (!name || !email || !password) {
            console.log('missing name or email or password');
            throw createHttpError(400, "parameters required");
        }
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
        console.log('token create end');
        console.log('cookie create start');
        res.cookie('token', token, {
            httpOnly: true,
            secure: validateEnv.NODE_ENV === 'production',
            sameSite: validateEnv.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        console.log('cookie created');
         res.status(201).json({success: true,user:newUser});
    } catch (e) {
        next(e)
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) :Promise<void>=> {
    console.log('in the login function');
    const {email, password} = req.body;

    try {
        if (!email || password) {
            console.log('missing email or password');
            throw  createHttpError(400, 'email or password required');
        }
        const userExist = await UserModel.findOne({email: email});
        if (!userExist) {
            console.log('user not found,enter correct email');
            throw createHttpError(401, "Invalid username or password")
        }
        const passwordMatch: boolean = await bcrypt.compare(password, userExist.password)
        if (!passwordMatch) {
            console.log('password not match,enter correct password');
            throw createHttpError(401, "Invalid username or password")
        }
        const tokenPayload = {id: userExist._id};
        const token = jwt.sign(tokenPayload, validateEnv.JWT_SECRET, {expiresIn: '1h'})
        res.cookie('token', token, {
            httpOnly: true,
            secure: validateEnv.NODE_ENV === 'production',
            sameSite: validateEnv.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(201).json({success: true,userExist});
    } catch (e) {
        next(e)
    }
}

export const logout = async (req: Request, res: Response, next: NextFunction) :Promise<void>=> {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: validateEnv.NODE_ENV === 'production',
            sameSite: validateEnv.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        res.status(201).json({success: true,message:'logged out successfully'});
    } catch (e) {
        next(e)
    }
}