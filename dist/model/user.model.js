"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const mongoose_1 = require("mongoose");
exports.userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAccountVerified: { type: Boolean, default: false },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpAt: { type: Number, default: 0 },
    resetOtp: { type: String, default: "" },
    resetOtpExpAt: { type: Number, default: 0 },
});
exports.default = (0, mongoose_1.model)("User", exports.userSchema);
//# sourceMappingURL=user.model.js.map