import { Request, Response } from "express";
import Stripe from 'stripe'
import StripeProducts from '../utils/StripeProducts';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const products = new StripeProducts(stripe);

export const createProducts = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const product1 = await products.createProduct("Plan Basic", "Basic subscription plan", 1000, 1);
        const product2 = await products.createProduct("Plan Standard", "Standard subscription plan", 2000, 1);
        const product3 = await products.createProduct("Plan Premium", "Premium subscription plan", 3000, 1);

        // Each product contains a `default_price` field with the Price ID.
        res.json({
            products: [
                { product: product1, priceId: product1.default_price, price: 1000 },
                { product: product2, priceId: product2.default_price, price: 2000 },
                { product: product3, priceId: product3.default_price, price: 3000 },
            ],
        });
    } catch (error) {
        console.error('Error creating products:', error);
        res.status(500).send("Something went wrong");
    }
};

export const createPaymentSession = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { price_id } = req.body;
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{
                price: price_id,
                quantity: 1,
            }],
            shipping_address_collection: {
                allowed_countries: ['IN']
            },
            subscription_data: {
                trial_period_days: 7,
            },
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        })

        res.json({ sessionId: session.id, url: session.url });

    } catch (error) {
        console.error('Error creating payment session:', error);
        res.status(500).send("Something went wrong");
    }
}