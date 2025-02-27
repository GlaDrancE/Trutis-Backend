import { Request, Response } from "express";
import Stripe from 'stripe'
import StripeProducts from '../utils/StripeProducts';
import prisma from "../db/prisma";
import { handlePaymentSuccess } from "../utils/paymentUtils";
import { handleInvoiceCreated } from "../utils/paymentUtils";
import { handlePaymentFailure } from "../utils/paymentUtils";
import { handleSubscriptionCreated } from "../utils/paymentUtils";
import { handleSubscriptionUpdated } from "../utils/paymentUtils";
import { handleSubscriptionCanceled } from "../utils/paymentUtils";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const products = new StripeProducts(stripe);

export const createProducts = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const clientId = req.body.clientId;
        const product1 = await products.createProduct("Plan Basic", "Basic subscription plan", 1000, 1, clientId);
        const product2 = await products.createProduct("Plan Standard", "Standard subscription plan", 2000, 1, clientId);
        const product3 = await products.createProduct("Plan Premium", "Premium subscription plan", 3000, 1, clientId);

        // Fetch the price details using priceId
        const price1 = await stripe.prices.retrieve(product1.default_price as string);
        const price2 = await stripe.prices.retrieve(product2.default_price as string);
        const price3 = await stripe.prices.retrieve(product3.default_price as string);

        res.json({
            products: [
                { product: product1, price: (price1.unit_amount ?? 0) / 100 },
                { product: product2, price: (price2.unit_amount ?? 0) / 100 },
                { product: product3, price: (price3.unit_amount ?? 0) / 100 },
            ],
        });

    } catch (error) {
        console.error('Error creating products:', error);
        res.status(500).send("Something went wrong");
    }
};

export const createPaymentSession = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { lookup_key, clientId } = req.body;
        const client = await prisma.clients.findFirst({
            where: {
                id: clientId
            }
        })
        if (!client) {
            return res.status(404).send("Client not found");
        }
        if (client.isActive) {
            return res.status(400).send("Client is already subscribed");
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: 'subscription',
            line_items: [{
                price: lookup_key,
                quantity: 1,
            }],
            shipping_address_collection: {
                allowed_countries: ['IN'],
            },
            subscription_data: {
                trial_period_days: 7,
                metadata: { client_id: clientId }
            },
            success_url: `${process.env.FRONTEND_URL}/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment?cancel=true`,
            metadata: { client_id: clientId },
            currency: 'inr',
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating payment session:', error);
        res.status(500).send("Something went wrong");
    }
};

export const createPortalSession = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { customerId } = req.body;
        console.log(customerId)
        const returnUrl = `${process.env.FRONTEND_URL}/dashboard`;
        // const checkoutSession = await stripe.checkout.sessions.create({
        //     customer: customerId,
        //     return_url: returnUrl,
        //     ui_mode: "embedded",
        //     subscription_data: {
        //         trial_period_days: 7,
        //     }
        // })
        // console.log("customerId", customerId)

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
        // console.log("portalSession", portalSession)
        if (portalSession.url) {
            res.status(200).json({ url: portalSession.url as string });
        } else {
            res.status(500).send("Something went wrong");
        }
    } catch (error) {
        console.error('Error creating portal session:', error);
        res.status(500).send("Something went wrong");
    }
};


export const webhook = async (req: Request, res: Response) => {
    // const sig = req.headers['stripe-signature'] as string;
    // const body = req.body;
    // let event: Stripe.Event;

    // console.log("Webhook received");
    // try {
    //     event = stripe.webhooks.constructEvent(
    //         body,
    //         sig,
    //         process.env.STRIPE_WEBHOOK_SECRET as string);
    //     console.log("event: ", event)
    // } catch (err: any) {
    //     console.error('Webhook signature verification failed:', err.message);
    //     return res.status(400).send(`Webhook Error: ${err.message}`);
    // }

    // // Handle the events
    // switch (event.type) {
    //     case 'customer.created':
    //         console.log('Customer created:', event.data.object);
    //         // TODO: Process customer creation
    //         break;
    //     case 'checkout.session.async_payment_failed':
    //         console.log('Checkout session async payment failed:', event.data.object);
    //         // TODO: Handle async payment failure in Checkout Session
    //         break;
    //     case 'checkout.session.async_payment_succeeded':
    //         console.log('Checkout session async payment succeeded:', event.data.object);
    //         // TODO: Handle async payment success in Checkout Session
    //         break;
    //     case 'checkout.session.completed':
    //         console.log('Checkout session completed:', event.data.object);
    //         // TODO: Process completed Checkout Session
    //         break;
    //     case 'checkout.session.expired':
    //         console.log('Checkout session expired:', event.data.object);
    //         // TODO: Handle expired Checkout Session
    //         break;
    //     case 'subscription_schedule.aborted':
    //         console.log('Subscription schedule aborted:', event.data.object);
    //         // TODO: Process subscription schedule abortion
    //         break;
    //     case 'subscription_schedule.canceled':
    //         console.log('Subscription schedule canceled:', event.data.object);
    //         // TODO: Process subscription schedule cancellation
    //         break;
    //     case 'subscription_schedule.completed':
    //         console.log('Subscription schedule completed:', event.data.object);
    //         // TODO: Process completed subscription schedule
    //         break;
    //     case 'subscription_schedule.created':
    //         console.log('Subscription schedule created:', event.data.object);
    //         // TODO: Process created subscription schedule
    //         break;
    //     case 'subscription_schedule.expiring':
    //         console.log('Subscription schedule expiring:', event.data.object);
    //         // TODO: Process expiring subscription schedule
    //         break;
    //     case 'subscription_schedule.released':
    //         console.log('Subscription schedule released:', event.data.object);
    //         // TODO: Process released subscription schedule
    //         break;
    //     case 'subscription_schedule.updated':
    //         console.log('Subscription schedule updated:', event.data.object);
    //         // TODO: Process updated subscription schedule
    //         break;

    //     case 'payment_intent.succeeded':
    //         console.log('Payment intent succeeded:', event.data.object);
    //         await savePaymentToDatabase(event.data);
    //         break;
    //     case 'customer.subscription.created':
    //         console.log('Customer subscription created:', event.data.object);
    //         await updateSubscription(
    //             event.data.object.customer as string,
    //             event.data.object.id,
    //             event.data.object.current_period_end,
    //             event.data.object.status,
    //             event.data.object.collection_method,
    //             event.data.object.currency
    //         );
    //         break;
    //     case 'customer.subscription.pending_update_applied':
    //         console.log('Customer subscription pending update applied:', event.data.object);
    //         await updateSubscription(
    //             event.data.object.customer as string,
    //             event.data.object.id,
    //             event.data.object.current_period_end,
    //             event.data.object.status,
    //             event.data.object.collection_method,
    //             event.data.object.currency
    //         );
    //         break;
    //     case 'customer.subscription.trial_will_end':
    //         console.log("Customer subscription trial will end:", event.data.object);
    //         // TODO: Send email to client
    //         break;
    //     case 'invoice.paid':
    //         console.log('Invoice paid:', event.data.object);
    //         await updateSubscription(
    //             event.data.object.customer as string,
    //             event.data.object.id,
    //             event.data.object.period_end,
    //             event.data.object.status as string,
    //             event.data.object.collection_method as string,
    //             event.data.object.currency as string);
    //         break;
    //     default:
    //         console.log(`Unhandled event type: ${event.type}`);
    // }
    // res.status(200).send("Webhook received");

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig as string,
            process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Dispatch events to appropriate handlers
    try {
        switch (event.type) {
            case 'invoice.payment_succeeded':
                await handlePaymentSuccess(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailure(event.data.object);
                break;
            case 'invoice.created':
                await handleInvoiceCreated(event.data.object);
                break;
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionCanceled(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        console.log("Received Endpoint")
        res.status(200).send("Received endpoint")
    } catch (error) {
        console.error('Error processing event:', error);
    }

    res.status(200).json({ received: true });
}




export const savePaymentToDatabase = async (data: Stripe.Event.Data) => {
    const session = data as Stripe.Checkout.Session;
    await prisma.clientPayments.create({
        data: {
            client_id: session.metadata?.client_id as string,
            amount: session?.amount_total ? session?.amount_total / 100 : 0,
            payment_date: new Date(),
            payment_type: "stripe",
            status: "completed",
            invoice_id: session.invoice as string | null,
            transaction_id: session.id,
            stripe_customer_id: session.customer as string,

        }
    })
}



export const verifyPayment = async (req: Request, res: Response) => {
    const { session_id } = req.body;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['subscription'], // Subscription is already expanded here
        });



        if (session.payment_status === "paid") {
            // await savePaymentToDatabase(session);
            return res.json({ success: true, sessionId: session_id, customerId: session.customer as string });
        } else {
            return res.json({ success: false, message: "Session not completed." });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

// async function savePaymentToDatabase(session: Stripe.Checkout.Session): Promise<void> {
//     try {
//         if (!session.metadata || !session.metadata.client_id) {
//             console.error("Client ID is missing in session metadata.");
//             return;
//         }

//         const clientId = session.metadata.client_id;
//         const customerId = session.customer as string;
//         const amount = session.amount_total ? session.amount_total / 100 : 0;
//         const paymentType = session.payment_method_types?.[0] || "unknown";
//         const status = session.payment_status === "paid" ? "completed" : "failed";

//         await prisma.clientPayments.create({
//             data: {
//                 client_id: clientId,
//                 amount: amount,
//                 payment_date: new Date(),
//                 payment_type: paymentType,
//                 status: status,
//                 invoice_id: session.invoice as string | null,
//                 transaction_id: session.id,
//                 stripe_customer_id: customerId,
//             },
//         });

//         console.log("Payment stored successfully:", session.id);
//     } catch (error) {
//         console.error("Error saving payment to database:", error);
//     }
// }


const updateSubscription = async (
    customerId: string,
    subscriptionId: string,
    expirationDate: number,
    status: string,
    collectionMethod: string,
    currency: string
) => {
    try {
        const clientPayment = await prisma.subscriptions.updateMany({
            where: {
                customer_id: customerId
            },
            data: {
                isActive: true,
                current_period_end: new Date(expirationDate * 1000),
                subscription_status: status,
                subscription_id: subscriptionId,
                collection_method: collectionMethod,
                currency: currency
            }
        })


    } catch (error) {

    }

}



export const VerifyClientPayment = async (req: Request, res: Response) => {
    try {
        const { clientId } = req.body;
        if (!clientId) {
            return res.status(400).json({ message: "Invalid Request" });
        }
        const client = await prisma.clients.findUnique({
            where: { id: clientId }
        })
        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }
        const payment = await prisma.clientPayments.findFirst({
            where: { client_id: clientId }
        })
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        if (payment.status === "success") {
            return res.status(200).json({ message: "Payment already verified" });
        }
        res.status(200).json({ message: "Payment verified" });
    } catch (error) {
        console.error("verifyPayment Error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
}