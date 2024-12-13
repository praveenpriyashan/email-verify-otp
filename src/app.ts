import express, {Request, Response, NextFunction} from 'express'
import "dotenv/config";
import createHttpError, {isHttpError, Unauthorized} from "http-errors";
import cookieParser from "cookie-parser";
// import cors from "cors"
import authRouter from "./routes/auth.route";
import userAuth from "./middleware/user.auth.middleware";

const app = express();
app.use(cookieParser());              // parse the cookies.
app.use(express.json());
// app.use(cors({credentials: true}))      //to allow the frontend to communicate with it.
app.use("/api/auth",authRouter)

// app.get('/', (req: Request, res: Response, next: NextFunction) => {
//     try {
//         console.log('start get request')
//         res.send('get api')
//     } catch (e) {
//         next(e)
//     }
// })

//there is no routes match ,execute
const httpErrorMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('start httperror middleware')
    next(createHttpError(404, 'endpoint not found'))
    console.log('end httperror middleware')
}
//handle * error
const errr = (error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.log('start error middleware')
    let errorMessage = "an unknown error message"
    let statusCode = 500;
    console.log('check its a http error')
    if (isHttpError(error)) {
        console.log('its a http error')
        statusCode = error.status
        errorMessage = error.message
    }
    console.log('ready send the response')
    res.status(statusCode).json({status: statusCode, error: errorMessage,success: false})
    console.log('end error middleware')
}


app.use(httpErrorMiddleware)                //use this befor error middleware
app.use(errr);                                     //this should be last middleware

export default app;
