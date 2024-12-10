import {Schema, InferSchemaType, model} from "mongoose";

const userSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    verifyOtp: {type: String, default: ""},
    verifyOtpExpAt: {type: Number, default: 0},
    isAccountVerified: {type: Boolean, default: false},
    resetOtp: {type: String, default: ""},
    resetOtpExpAt: {type: Number, default: 0},
});
//using userSchema create userModel
type User = InferSchemaType<typeof userSchema>;
export default model<User>("User", userSchema)