import { Request, Response } from "express";
import { generateOTP, storeOTP, verifyOTP } from "../utils/otpUtils";
import sendMail from "../config/emailConfig";

export const GenerateOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        console.log(email)
        const otp = generateOTP();
        if (!email) {
            return res.status(400).send("Invalid Email");
        }
        storeOTP(email, otp);
        sendMail(email, "OTP For Email Verification", `Your OTP is ${otp}, Please verify your email`);
        res.status(200).send("OTP sent successfully");
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error");
    }
}
export const VerifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).send("Invalid OTP");
        }
        const verify = verifyOTP(email, otp);
        if (!verify.valid) {
            return res.status(400).send(verify.message);
        }
        res.status(200).send("OTP verified successfully");
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error");
    }
}