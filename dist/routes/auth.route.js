"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controller/auth.controller");
const user_auth_middleware_1 = __importDefault(require("../middleware/user.auth.middleware"));
const authRouter = express_1.default.Router();
authRouter.post("/register", auth_controller_1.register);
authRouter.post("/login", auth_controller_1.login);
authRouter.post("/logout", auth_controller_1.logout);
authRouter.post("/send-verify-otp", user_auth_middleware_1.default, auth_controller_1.sendVerifyOtp);
authRouter.post("/verify-account", user_auth_middleware_1.default, auth_controller_1.verifyEmail);
exports.default = authRouter;
//# sourceMappingURL=auth.route.js.map