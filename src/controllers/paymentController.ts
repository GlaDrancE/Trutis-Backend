import { Request, Response } from "express";
import Stripe from 'stripe'
import StripeProducts from '../utils/StripeProducts';
import prisma from "../db/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const products = new StripeProducts(stripe);

export const createProducts = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const product1 = await products.createProduct("Plan Basic", "Basic subscription plan", 1000, 1);
        const product2 = await products.createProduct("Plan Standard", "Standard subscription plan", 2000, 1);
        const product3 = await products.createProduct("Plan Premium", "Premium subscription plan", 3000, 1);

        // Fetch the price details using priceId
        const price1 = await stripe.prices.retrieve(product1.default_price as string);
        const price2 = await stripe.prices.retrieve(product2.default_price as string);
        const price3 = await stripe.prices.retrieve(product3.default_price as string);

        res.json({
            products: [
                { product: product1, price: price1.unit_amount },
                { product: product2, price: price2.unit_amount },
                { product: product3, price: price3.unit_amount },
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
        console.log("clientId", clientId);

        console.log("lookup_key  ", lookup_key)
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
            },
            success_url: `${process.env.FRONTEND_URL}/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment?cancel=true`,
            metadata: { client_id: clientId }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating payment session:', error);
        res.status(500).send("Something went wrong");
    }
};

export const createPortalSession = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { sessionId } = req.body;
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
        const returnUrl = `${process.env.FRONTEND_URL}/dashboard`;
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: checkoutSession.customer as string,
            return_url: returnUrl,
        });
        console.log("portalSession", portalSession)
        res.redirect(303, portalSession.url);
    } catch (error) {
        console.error('Error creating portal session:', error);
        res.status(500).send("Something went wrong");
    }
};



export const webhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (err: any) {
        console.error("Webhook error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;
            console.log("Payment successful:", session);

            break;

        case "invoice.payment_succeeded":
            console.log("Invoice paid:", event.data.object);
            break;

        case "customer.subscription.deleted":
            console.log("Subscription canceled:", event.data.object);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
};

export const verifyPayment = async (req: Request, res: Response) => {
    const { session_id } = req.body;

    try {

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === "paid") {
            await savePaymentToDatabase(session);
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: "Payment not completed." });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
}

async function savePaymentToDatabase(session: Stripe.Checkout.Session): Promise<void> {
    try {
        if (!session.metadata || !session.metadata.client_id) {
            console.error("Client ID is missing in session metadata.");
            return;
        }

        console.log(session)
        const clientId = session.metadata.client_id;
        const amount = session.amount_total ? session.amount_total / 100 : 0;
        const paymentType = session.payment_method_types?.[0] || "unknown";
        const status = session.payment_status === "paid" ? "completed" : "failed";

        await prisma.clientPayments.create({
            data: {
                client_id: clientId,
                amount: amount,
                payment_date: new Date(),
                payment_type: paymentType,
                status: status,
                invoice_id: session.invoice as string | null,
                transaction_id: session.id,
            },
        });

        console.log("Payment stored successfully:", session.id);
    } catch (error) {
        console.error("Error saving payment to database:", error);
    }
}
