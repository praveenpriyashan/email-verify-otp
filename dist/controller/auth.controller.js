"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const user_model_1 = __importDefault(require("../model/user.model"));
const validateEnv_1 = __importDefault(require("../util/validateEnv"));
const http_errors_1 = __importDefault(require("http-errors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            console.log('missing name or email or password');
            throw (0, http_errors_1.default)(400, "parameters required");
        }
        const existUser = await user_model_1.default.findOne({ email: email });
        if (existUser) {
            console.log('email already exists');
            throw (0, http_errors_1.default)(409, "user already exists");
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await user_model_1.default.create({ name, email, password: hashedPassword });
        // res.status(201).json(newUser);
        console.log('user register successful');
        console.log('token create start');
        const tokenPayload = { id: newUser._id };
        const token = jsonwebtoken_1.default.sign(tokenPayload, validateEnv_1.default.JWT_SECRET, { expiresIn: '1h' });
        console.log('token create end');
        console.log('cookie create start');
        res.cookie('token', token, {
            httpOnly: true,
            secure: validateEnv_1.default.NODE_ENV === 'production',
            sameSite: validateEnv_1.default.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        console.log('cookie created');
        res.status(201).json({ success: true, user: newUser });
    }
    catch (e) {
        next(e);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    console.log('in the login function');
    const { email, password } = req.body;
    try {
        if (!email || password) {
            console.log('missing email or password');
            throw (0, http_errors_1.default)(400, 'email or password required');
        }
        const userExist = await user_model_1.default.findOne({ email: email });
        if (!userExist) {
            console.log('user not found,enter correct email');
            throw (0, http_errors_1.default)(401, "Invalid username or password");
        }
        const passwordMatch = await bcrypt_1.default.compare(password, userExist.password);
        if (!passwordMatch) {
            console.log('password not match,enter correct password');
            throw (0, http_errors_1.default)(401, "Invalid username or password");
        }
        const tokenPayload = { id: userExist._id };
        const token = jsonwebtoken_1.default.sign(tokenPayload, validateEnv_1.default.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: validateEnv_1.default.NODE_ENV === 'production',
            sameSite: validateEnv_1.default.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(201).json({ success: true, userExist });
    }
    catch (e) {
        next(e);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: validateEnv_1.default.NODE_ENV === 'production',
            sameSite: validateEnv_1.default.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        res.status(201).json({ success: true, message: 'logged out successfully' });
    }
    catch (e) {
        next(e);
    }
};
exports.logout = logout;
//# sourceMappingURL=auth.controller.js.map