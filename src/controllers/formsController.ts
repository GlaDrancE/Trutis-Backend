import { Request, Response } from 'express'
import prisma from '../db/prisma';
import { calculatePoints, handleCouponValidation } from '../utils/calculatePoints';
import sendMail from '../config/emailConfig';
import { uploadFileToGCS } from '../utils/googleCloudStorage';



export const storeCustomers = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { clientId, code, email, name, phone, DOB, ratings } = req.body
        const reviewImage = req.file;
        console.log(req.file)
        if (reviewImage) {
            const imageUrl = await uploadFileToGCS(reviewImage, `reviews-images/sample-image`)
            console.log("Image URL: ", imageUrl)
            return res.status(200).send({
                message: "Image uploaded successfully",
                imageUrl: imageUrl
            })
        }

        if (!clientId || !email || !name || !phone || !DOB || !ratings) {
            return res.status(400).send({
                message: "Missing fields",
                field: [
                    !clientId && "Client ID",
                    !email && "Email",
                    !phone && "Phone",
                    !name && "Name",
                    !DOB && "DOB",
                    !ratings && "Ratings",
                ]
            })

        }

        const getCustomer = await prisma.couponCustomers.findFirst({
            where: {
                OR: [
                    {
                        Customers: {
                            email: email
                        },
                        Coupons: {
                            code: code
                        }
                    }
                ]
            },
            include: {
                Coupons: true,
                Customers: true
            }

        })
        if (getCustomer) {
            return res.status(400).send("Customer already exists")
        }

        const customer = await prisma.customers.create({
            data: {
                email: email,
                name: name,
                phone: phone,
                DOB: new Date(),
                ratings: ratings
            }
        })

        if (!customer) {
            return res.status(400).send("Failed to create customer")
        }
        // TODO: apply redis client cache here
        const getClient = await prisma.clients.findFirst({
            where: { id: clientId }
        })

        if (!getClient) {
            return res.status(400).send("Failed to store token")
        }
        const validityDate = handleCouponValidation(getClient.couponValidity);
        if (!validityDate) {
            return res.status(400).send("Invalid coupon")
        }
        const coupon = await prisma.coupons.create({
            data: {
                code: code,
                validTill: validityDate,
                maxDiscount: 50,
                minOrderValue: 100,
            }
        })
        const couponClient = await prisma.couponClients.create({
            data: {
                clientId: clientId,
                couponId: coupon.id,
                isUsed: false,
                usedAt: new Date(0)
            }
        })
        const couponCustomer = await prisma.couponCustomers.create({
            data: {
                couponId: coupon.id,
                customersId: customer.id
            }
        })
        await prisma.couponClientsCustomers.create({
            data: {
                couponClientID: couponClient.id,
                couponCustomerId: couponCustomer.id
            }
        })
        await prisma.points.create({
            data: {
                customerId: customer.id,
                points: 0
            }
        })
        if (!coupon) {
            return res.status(400).send("Failed to create coupon");
        }

        res.status(201).send("Coupon created successfully")

    } catch (error) {
        console.error(error)
        return res.status(500).send("Something went wrong")
    }
}


export const getCoupons = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { client_id } = req.body;
        if (!client_id) {
            return res.status(400).send("Client ID is required")
        }
        const coupons = await prisma.couponClients.findMany({
            where: {
                clientId: client_id
            },
            include: {
                Coupon: true
            }
        })
        if (!coupons) {
            return res.status(400).send("No coupons found")
        }
        return res.status(200).send(coupons)
    } catch (error) {
        console.error(error)
        return res.status(500).send("Something went wrong")
    }
}


export const generatePoints = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { email, amount } = req.body;
        if (!email) {
            return res.status(400).send("Email is required")
        }
        const getCustomer = await prisma.customers.findFirst({
            where: {
                email: email
            }
        })
        if (!getCustomer) {
            return res.status(400).send("Customer not found")
        }
        const getPoints = await prisma.points.findFirst({
            where: {
                customerId: getCustomer.id
            }
        })
        if (!getPoints) {
            return res.status(400).send("Points not found")
        }
        await prisma.points.updateMany({
            where: {
                customerId: getCustomer.id
            },
            data: {
                points: calculatePoints(amount, getPoints.points)
            }
        })
        sendMail(email, "Congratulations! you have received points", `You have received ${getPoints.points} points`)
        return res.status(200).send("Points generated successfully")
    } catch (error) {
        console.error(error)
        return res.status(500).send("Something went wrong")
    }
}

