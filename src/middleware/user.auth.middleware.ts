import jwt from "jsonwebtoken"
import {NextFunction, Response, Request} from "express";
import createHttpError from "http-errors";
import validateEnv from "../util/validateEnv";
import {JwtPayload} from "jsonwebtoken";
import cookieParser from "cookie-parser";

const userAuth = async (req: Request, res: Response, next: NextFunction) => {
    console.log('inside the userAuth middleware function')
    try {
        console.log('inside the try block')
        console.log(req.cookies)
        const {token} = req.cookies;
        if (!token) {
            console.log('no token found in userAuth middleware function')
            throw createHttpError(400, 'UnAuthorized User')
        }
        console.log('get token successfully')
        console.log(token)
        const tokenDecode = jwt.verify(token, validateEnv.JWT_SECRET);
        if (typeof tokenDecode === "object" && "id" in tokenDecode) {
            req.body.userId = (tokenDecode as JwtPayload).id; // Explicit type cast
            console.log("in the userAuth middleware, get token,get tokenDecade,assign to userId of req");
        } else {
            console.log("Token is invalid,cant assign to the req's userId");
            throw createHttpError(400, "Unauthorized User");
        }
        console.log(`req.body = ${req.body}`)
        console.log(`req.body.userId = ${req.body.userId}`)
        console.log("userAuth middleware function executed successfully");
        next();
    } catch (e) {
        next(e)
    }
}
export default userAuth;