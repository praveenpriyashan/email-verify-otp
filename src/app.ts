import express, {Request, Response, NextFunction} from 'express'
import "dotenv/config";
// import UserRoutes from "./routes/UserRoutes"
import createHttpError, {isHttpError} from "http-errors";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();
// app.use("/users",UserRoutes)


const httpErrorMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('start httperror middleware')
    next(createHttpError(404, 'endpoint not found'))
    console.log('end httperror middleware')
}
const errr = (error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.log('start error middleware')
    console.log(error)
    let errorMessage = "an unknown error message"
    let statusCode = 500;
    if (isHttpError(error)) {
        statusCode = error.status;
        errorMessage = error.message
    }
    res.status(statusCode).json({error: errorMessage})
    console.log('end error middleware')
}

app.use(express.json());
app.use(httpErrorMiddleware)
app.use(errr);
app.use(cookieParser())                   // parse the cookies.
app.use(cors({credentials:true}))      //to allow the frontend to communicate with it.
export default app;



