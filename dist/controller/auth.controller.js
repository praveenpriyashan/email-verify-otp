"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.sendVerifyOtp = exports.logout = exports.login = exports.register = void 0;
const validateEnv_1 = __importDefault(require("../util/validateEnv"));
const http_errors_1 = __importDefault(require("http-errors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = require("../config/nodemailer");
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = __importDefault(require("../model/user.model"));
dotenv_1.default.config();
const register = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            console.log('missing name or email or password');
            throw (0, http_errors_1.default)(400, "parameters required");
        }
        console.log('get req body successfully');
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
        if (!token) {
            console.log('token not created');
            throw (0, http_errors_1.default)(500, "internal server error");
        }
        console.log('token create end');
        console.log('cookie create start');
        res.cookie('token', token, {
            httpOnly: true,
            // secure: validateEnv.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production' ? true : false, // In development, set to false
            sameSite: validateEnv_1.default.NODE_ENV === 'production' ? 'none' : 'strict',
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
        };
        console.log('sending email start');
        await nodemailer_1.transporter.sendMail(mailOption);
        console.log('Email sent successfully');
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
        if (!email || !password) {
            console.log('missing email or password');
            throw (0, http_errors_1.default)(400, 'email or password required');
        }
        const userExist = await user_model_1.default.findOne({ email: email });
        if (!userExist) {
            console.log('user not found,enter correct email');
            throw (0, http_errors_1.default)(401, "Invalid username or password");
        }
        console.log('user found');
        const passwordMatch = await bcrypt_1.default.compare(password, userExist.password);
        if (!passwordMatch) {
            console.log('password not match,enter correct password');
            throw (0, http_errors_1.default)(401, "Invalid username or password");
        }
        console.log('password id correct');
        console.log('token create start');
        const tokenPayload = { id: userExist._id };
        const token = jsonwebtoken_1.default.sign(tokenPayload, validateEnv_1.default.JWT_SECRET, { expiresIn: '1h' });
        if (!token) {
            console.log('token not created');
            throw (0, http_errors_1.default)(500, "internal server error");
        }
        console.log('token created');
        console.log('cookie create start');
        res.cookie('token', token, {
            httpOnly: true,
            // secure: validateEnv.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production' ? true : false, // In development, set to false
            sameSite: validateEnv_1.default.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        console.log('cookie create end');
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
const sendVerifyOtp = async (req, res, next) => {
    console.log('start the sent otp function');
    console.log('req.body:', req.body); // Check if the body has the expected data
    console.log('go to the try block');
    try {
        const { userId } = req.body;
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw (0, http_errors_1.default)(404, 'User not found');
            console.log('user not found in sendVerifyOtp function');
        }
        if (user.isAccountVerified) {
            throw (0, http_errors_1.default)(404, 'account is already verifying');
            console.log('account is already verifying');
        }
        console.log('start the create otp');
        const otp = String(Math.floor(100000 + Math.random() * 900000));
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
        };
        console.log('ready to sent otp message via email');
        await nodemailer_1.transporter.sendMail(mailOption);
        console.log('send the otp message via email');
        res.json({ success: true, message: `verification otp sent on ${user.email}` });
    }
    catch (e) {
        next(e);
    }
};
exports.sendVerifyOtp = sendVerifyOtp;
const verifyEmail = async (req, res, next) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
        throw (0, http_errors_1.default)(400, 'missing required details');
        console.log('userId & otp missing in verifyEmail function');
    }
    console.log(`
    userId=${userId}
    otp=${otp}
    `);
    try {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw (0, http_errors_1.default)(404, 'user not found');
            console.log('user not found in verifyEmail function');
        }
        console.log('get user successfully');
        console.log(`user=${user}`);
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            throw (0, http_errors_1.default)(404, 'invalid otp');
            console.log('invalid otp in verifyEmail function');
        }
        console.log('otp verify without expire date');
        if (user.verifyOtpExpAt < Date.now()) {
            throw (0, http_errors_1.default)(404, ' OTP expired');
            console.log('OTP expired in verifyEmail function');
        }
        console.log('successfully verified OTP & ready update user to isAccountVerified=true');
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpAt = 0;
        await user.save();
        console.log('end update user to isAccountVerified=true');
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verified successfully',
            text: `
            Hi ${user.name} wellcome to FOOD CORNER
            Your account has been verified successfully.
            `
        };
        await nodemailer_1.transporter.sendMail(mailOption);
        console.log('send the otp message via email');
        res.json({ success: true, message: `email : ${user.email} verified successfully` });
    }
    catch (e) {
        next(e);
    }
};
exports.verifyEmail = verifyEmail;
//# sourceMappingURL=auth.controller.js.map