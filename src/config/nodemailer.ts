import nodemailer from 'nodemailer';
import validateEnv from "../util/validateEnv";
import dotenv from 'dotenv';
dotenv.config();

 export const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})
