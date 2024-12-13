"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const http_errors_1 = __importStar(require("http-errors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import cors from "cors"
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)()); // parse the cookies.
app.use(express_1.default.json());
// app.use(cors({credentials: true}))      //to allow the frontend to communicate with it.
app.use("/api/auth", auth_route_1.default);
// app.get('/', (req: Request, res: Response, next: NextFunction) => {
//     try {
//         console.log('start get request')
//         res.send('get api')
//     } catch (e) {
//         next(e)
//     }
// })
//there is no routes match ,execute
const httpErrorMiddleware = (req, res, next) => {
    console.log('start httperror middleware');
    next((0, http_errors_1.default)(404, 'endpoint not found'));
    console.log('end httperror middleware');
};
//handle * error
const errr = (error, req, res, next) => {
    console.log('start error middleware');
    let errorMessage = "an unknown error message";
    let statusCode = 500;
    console.log('check its a http error');
    if ((0, http_errors_1.isHttpError)(error)) {
        console.log('its a http error');
        statusCode = error.status;
        errorMessage = error.message;
    }
    console.log('ready send the response');
    res.status(statusCode).json({ status: statusCode, error: errorMessage, success: false });
    console.log('end error middleware');
};
app.use(httpErrorMiddleware); //use this befor error middleware
app.use(errr); //this should be last middleware
exports.default = app;
//# sourceMappingURL=app.js.map