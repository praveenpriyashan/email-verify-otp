"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_errors_1 = __importDefault(require("http-errors"));
const validateEnv_1 = __importDefault(require("../util/validateEnv"));
const userAuth = async (req, res, next) => {
    console.log('inside the userAuth middleware function');
    try {
        console.log('inside the try block');
        console.log(req.cookies);
        const { token } = req.cookies;
        if (!token) {
            console.log('no token found in userAuth middleware function');
            throw (0, http_errors_1.default)(400, 'UnAuthorized User');
        }
        console.log('get token successfully');
        console.log(token);
        const tokenDecode = jsonwebtoken_1.default.verify(token, validateEnv_1.default.JWT_SECRET);
        if (typeof tokenDecode === "object" && "id" in tokenDecode) {
            req.body.userId = tokenDecode.id; // Explicit type cast
            console.log("in the userAuth middleware, get token,get tokenDecade,assign to userId of req");
        }
        else {
            console.log("Token is invalid,cant assign to the req's userId");
            throw (0, http_errors_1.default)(400, "Unauthorized User");
        }
        console.log(`req.body = ${req.body}`);
        console.log(`req.body.userId = ${req.body.userId}`);
        console.log("userAuth middleware function executed successfully");
        next();
    }
    catch (e) {
        next(e);
    }
};
exports.default = userAuth;
//req=>cookies=>token=>userid      set the       =>      req.body.userId
//# sourceMappingURL=user.auth.middleware.js.map