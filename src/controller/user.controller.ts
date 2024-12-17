import {NextFunction, Response, Request} from "express";
import UserModel from "../model/user.model";
import {IUser} from "./auth.controller";
import createHttpError from "http-errors";


export const getUserData = async (req: Request, res: Response, next: NextFunction) => {
    console.log('inside the getUserdata function')
    const {userId} = req.body;
    try {
        console.log('inside try block')
        const user = await UserModel.findById(userId) as IUser;
        if (!user) {
            console.log('user not found')
            throw createHttpError(404, 'user not found');
        }
        console.log('user found')
        res.json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
            }
        })
        console.log('getUserData function executed successfully');
    } catch (e) {
        next(e)
    }
}