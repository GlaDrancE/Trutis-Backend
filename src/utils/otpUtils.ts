import crypto from 'crypto';
interface storeOtp {
    email: string,
    otp?: number,
    userOTP?: number,
}

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const otpStore = new Map();

export const storeOTP = (email: string, otp: string) => {
    const expiryTime = Date.now() + 15 * 60 * 1000; // 15 minutes from now
    otpStore.set(email, {
        otp,
        expiryTime
    });
};

export const verifyOTP = (email: string, userOTP: string) => {
    const otpData = otpStore.get(email);

    if (!otpData) {
        return { valid: false, message: 'No OTP found for this email' };
    }

    if (Date.now() > otpData.expiryTime) {
        otpStore.delete(email);
        return { valid: false, message: 'OTP has expired' };
    }

    if (otpData.otp !== userOTP) {
        return { valid: false, message: 'Invalid OTP' };
    }

    otpStore.delete(email);
    return { valid: true, message: 'OTP verified successfully' };
};

