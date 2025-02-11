import { Request, Response } from "express";
import prisma from "../db/prisma";
import bcrypt from "bcryptjs";
import Razorpay from 'razorpay'
import { Validator } from "../middlewares/validator";
import { CloudinaryUpload } from "../utils/cloudinary";
import { OAuth2Client } from 'google-auth-library'


import jwt, { verify } from "jsonwebtoken";

import { generateOTP, storeOTP } from "../utils/otpUtils"

import { generateRandom } from "../utils/generateRand";
import sendEmail from "../config/emailConfig";
import redisClient from "../utils/caching";



const JWT_SECRET = process.env.JWT_SECRET
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
// Fetch all clients
export const GetClients = async (req: Request, res: Response): Promise<Response | void> => {
    try {

        const clients = await prisma.clients.findMany();
        const clientPlan = await prisma.clientPlans.findMany()
        const enrichedClients = clients.map((client: any) => {
            const activePlan = clientPlan.filter((cp: any) => client.id === cp.client_id && cp.isActive)
            return {
                ...client,
                activePlan: activePlan
            }
        })
        // await redisClient.set('clients', JSON.stringify(enrichedClients))
        res.status(200).json(enrichedClients);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
};

export const GetClient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).send("Id not found, Invalid request")
        }
        const client = await prisma.clients.findUnique({
            where: {
                id: id
            },
            include: {
                AgentClients: {
                    include: {
                        agent: true,
                    }
                }
            }
        })
        console.log(client)
        if (!client) {
            return res.status(404).send("Client Not Found")
        }
        res.status(200).json(client)
    } catch (error) {
        console.error(error)
        res.status(500).send("Internal server error")

    }
}
export const ClientLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;


        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const client = await prisma.clients.findFirst({
            where: {
                email: email
            }
        })
        if (!client) {
            return res.status(400).send("Invalid email")
        }
        const isPasswordValid = await bcrypt.compare(password, client.password)
        if (!isPasswordValid) {
            return res.status(401).send("Password does not matched")
        }


        // Generate OTP
        const otp = generateOTP();

        // Store OTP with expiry
        // storeOTP(email, otp);

        // Send OTP via email
        // const emailSent = await sendEmail(
        //     email,
        //     'Login OTP',
        //     `Your OTP for login is: ${otp}. This OTP will expire in 15 minutes.`
        // );

        // if (!emailSent) {
        //     return res.status(500).json({ error: 'Failed to send OTP email' });
        // }
        if (!JWT_SECRET) {
            return res.status(400).send("Failed to load token")
        }
        const token = jwt.sign({ userId: client.id }, JWT_SECRET, { expiresIn: '1d' })

        res.status(200).json({ userId: client.id, token: token })

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const CreateInitClient = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { email, owner_name, password, logo, ipAddress, contractTime, authProvider } = req.body;

        // Validate input data
        if (!email || !owner_name || !password) {
            return res.status(400).json({
                error: "Missing required fields",
                missingFields: [
                    !email && "email",
                    !owner_name && "owner_name",
                    !password && "password"
                ].filter(Boolean)
            });
        }

        // Check if the client already exists
        const existingClient = await prisma.clients.findFirst({
            where: { email: email }
        });
        if (existingClient) {
            return res.status(400).json({ error: "Client already exists" });
        }

        // Create the new client
        const newClient = await prisma.clients.create({
            data: {
                email: email,
                owner_name: owner_name,
                password: await bcrypt.hash(password, 10),
                isActive: false,
                logo: logo,
                ipAddress: ipAddress,
                contractTime: contractTime,
                authProvider: authProvider
            }
        });

        if (!JWT_SECRET) {
            console.log("Failed to load token")
            return res.status(400).send("Failed to load token")
        }
        const token = jwt.sign({ userId: newClient.id }, JWT_SECRET, { expiresIn: '1d' })
        res.status(201).json({ token: token });
    } catch (error) {
        console.error("Something went wrong: ", error);
        res.status(500).send("Internal server error");
    }
};
export const CreateGoogleClient = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { email, owner_name, password, logo, ipAddress, authProvider, token, contractTime } = req.body;

        if (!email || !owner_name || !password || !ipAddress || !authProvider || !contractTime) {
            return res.status(404).json({
                error: "Missing field", message: [
                    !email && "email",
                    !password && "password",
                    !ipAddress && "IP Address",
                    !authProvider && "Auth Provider",
                ].filter(Boolean)
            })
        }
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        const payload = ticket.getPayload();
        console.log(payload)
        if (!payload) {
            return res.status(400).send("Failed to load token")
        }
        const existing_client = await prisma.clients.findFirst({
            where: {
                email: email
            }
        })
        if (existing_client) {
            return res.status(400).send("User Already Exists")
        }
        const login_client = await prisma.clients.create({
            data: {
                email: email,
                owner_name: owner_name,
                password: await bcrypt.hash(password, 10),
                isActive: false,
                authProvider: authProvider,
                logo: logo,
                ipAddress: ipAddress,
                contractTime: contractTime
            }
        })
        if (!login_client) {
            return res.status(400).send("Failed to create Account")
        }
        res.status(201).json({ userId: login_client.id, payload: payload })
    } catch (error) {
        console.error(error)
        res.status(500).send("Internal server error")
    }
}

export const CreateClient = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const {
            email, password, shop_name, owner_name,
            address, phone, googleAPI, plan_id, agent_id
        } = req.body;
        const imgPath = req.file?.originalname;
        let logo = await CloudinaryUpload(imgPath as string)
        if (!logo) {
            console.log("Failed to upload image")
            logo = "Error string"
        }
        if (!email || !password || !owner_name || !address || !phone || !plan_id) {
            return res.status(400).json({
                error: "Missing required fields",
                missingFields: [
                    !email && "email",
                    !password && "password",
                    !shop_name && "shop_name",
                    !owner_name && "owner_name",
                    !address && "address",
                    !phone && "phone",
                    !plan_id && "plan_id"
                ].filter(Boolean)
            });
        }
        const data = {
            email,
            password,
            shop_name,
            owner_name,
            address,
            phone
        };

        const validateData = Validator.validateClient(data);
        if (!validateData) {
            return res.status(400).send("Invalid Request");
        }
        const plan = await prisma.plans.findFirst({
            where: {
                id: plan_id
            }
        })
        if (!plan) {
            return res.status(404).send("Subscription Plan not found")
        }
        const existingUser = await prisma.clients.findFirst({
            where: {
                email: email,
            }
        })
        if (existingUser) {
            return res.status(400).send("User already exists")
        }
        let AvailableQR = await prisma.qRCodes.findFirst({
            where: {
                client_id: null
            }
        });
        if (!AvailableQR) { return res.status(404).send("QR Not Available ") }
        console.log("AVAILABLE QRS: ", AvailableQR)
        // console.log(AvailableQR)
        // if (!AvailableQR) {
        //     console.log("QR codes are not available")
        //     console.log("Generating...");

        //     const public_key = generateRandom(4);
        //     const private_key = public_key + generateRandom(4);

        //     AvailableQR = await prisma.qRCodes.create({
        //         data: {
        //             public_key: public_key,
        //             private_key: private_key
        //         }
        //     })
        // }

        const newClient = await prisma.clients.create({
            data: {
                shop_name: shop_name,
                qr_id: AvailableQR?.public_key,
                owner_name: owner_name,
                address: address,
                phone: phone,
                email: email,
                logo: logo,
                isActive: true,
                ipAddress: "",
                contractTime: Date(),
                googleAPI: googleAPI,
                password: await bcrypt.hash(password, 10),
            },
        });
        if (!newClient) {
            return res.status(500).send("Internal Server error, Failed to create client");
        }
        await prisma.clientPlans.create({
            data: {
                client_id: newClient.id,
                plan_id: plan_id,
                isActive: true
            }
        })
        const qrUpdate = await prisma.qRCodes.update({
            where: {
                id: AvailableQR?.id
            },
            data: {
                client_id: newClient.id
            }
        })
        await prisma.agentClients.create({
            data: {
                client_id: newClient.id,
                agent_id: agent_id,
            }
        })
        res.status(201).json({ msg: "Client Created", public_id: qrUpdate.public_key });
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error");
    }
};

// Update a client
export const UpdateClient = async (req: Request, res: Response): Promise<Response | void> => {
    try {

        const {
            email, shop_name, owner_name,
            address, phone, googleAPI
        } = req.body;
        const { id } = req.params;

        const imgPath = req.file?.originalname;
        let logo = await CloudinaryUpload(imgPath as string);

        if (logo) {
            console.log("Error in updating logo")
            logo = 'Error'
        }

        if (!email || !shop_name || !owner_name || !address || !phone) {
            return res.status(400).json({
                error: "Missing required fields",
                missingFields: [
                    !email && "email",
                    !shop_name && "shop_name",
                    !owner_name && "owner_name",
                    !address && "address",
                    !phone && "phone",
                ].filter(Boolean)
            });
        }


        const updatedClient = await prisma.clients.update({
            where: { id: id },
            data: {
                shop_name: shop_name,
                owner_name: owner_name,
                email: email,
                phone: phone,
                address: address,
                logo: logo,
                googleAPI: googleAPI
            },
        });
        console.log(updatedClient)

        res.status(200).send("Client Updated");
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error");
    }
};

// Delete a client
export const DeleteClient = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).send("Invalid Request");
        }
        await prisma.clientPlans.deleteMany({
            where: { client_id: id }
        });
        await prisma.clients.delete({
            where: { id: id },
        });
        res.status(200).send("Client Deleted");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");

    }
};





export const SubPlans = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const plans = await prisma.plans.findMany();
        res.status(200).json(plans);
    } catch (error) {

        console.log(error)
        res.status(500).send("Internal Server Error");
    }
}



export const ClientForms = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).send("Invalid Request")
        }
        const client = await prisma.clients.findFirst({
            where: {
                qr_id: id
            }
        })
        if (!client) {
            return res.status(404).send("No Data Found");
        }
        return res.status(200).send(client)
    } catch (error) {

        res.status(500).send("Internal server error")
    }
}

export const CreatePaymentOrder = async (req: Request, res: Response) => {
    const razorpay = new Razorpay({
        key_id: 'rzp_test_OwTHyuNEPtrhN5',
        key_secret: ''
    })
    const { amount } = req.body;

    const options = {
        amount: amount * 100,  // amount in paise
        currency: 'INR',
        receipt: 'receipt#1'
    };

    try {
        const response = await razorpay.orders.create(options);
        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount
        });
    } catch (error) {
        res.status(500).send(error);
    }
}