import mongoose, {Schema, InferSchemaType, model} from "mongoose";

export const userSchema = new  Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    isAccountVerified: {type: Boolean, default: false},
    verifyOtp: {type: String, default: ""},
    verifyOtpExpAt: {type: Number, default: 0},
    resetOtp: {type: String, default: ""},
    resetOtpExpAt: {type: Number, default: 0},
});
//using userSchema create userModel
type User = InferSchemaType<typeof userSchema>;
export default model<User>("User", userSchema)