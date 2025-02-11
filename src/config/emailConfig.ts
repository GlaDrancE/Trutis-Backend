import nodemailer, { createTransport } from 'nodemailer'
import { google } from 'googleapis'
import { resolve } from 'path';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
const OAuth2 = google.auth.OAuth2;

const createTransportor = async () => {

    try {
        const client = new OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
        )
        client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        })
        const accessToken = await new Promise<string>((resolve, reject) => {
            client.getAccessToken((err, token) => {
                if (err) {
                    console.log("Failed to get access token")
                    reject(err)
                } else if (token) {
                    resolve(token)
                } else {
                    console.log("No token found")
                    reject("No Token Found")
                }
            })
        })
        const transporterOption: SMTPTransport.Options = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            service: "gmail",
            auth: {
                type: 'OAuth2',
                user: 'admin.google@cosie.io',
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                accessToken: accessToken,
                expires: 3599
            }
        }
        const transporter = nodemailer.createTransport(transporterOption)
        return transporter;

    } catch (error) {
        console.error(error)
    }
}


const sendMail = async (to: string, subject: string, text: string) => {
    try {
        const transporter = await createTransportor();
        if (!transporter) {
            console.log("Failed to create transporter")
            return false;
        }
        await transporter.sendMail({
            from: 'admin.google@cosie.io',
            to: to,
            subject: subject,
            text: text
        })
        return true;
    } catch (error) {
        console.error("Failed to send email", error)
        return false
    }
}

export default sendMail;