import { Request, Response } from "express";
import { verifyOTP } from "../utils/otpUtils";

// Verify OTP endpoint
export const VerifyOtp = (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const verificationResult = verifyOTP(email, otp);

        if (!verificationResult.valid) {
            return res.status(400).json({ error: verificationResult.message });
        }

        // Here you can generate JWT token or session for the user
        res.json({
            message: 'Login successful',
            // token: generateToken(email) // Implement your token generation logic
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
