import express, { RequestHandler } from 'express';
import { Router } from 'express';
import Stripe from 'stripe'
import StripeProducts from '../utils/StripeProducts';
import { createPaymentSession, createProducts, webhook, verifyPayment, createPortalSession } from '../controllers/paymentController';

const paymentRoutes: Router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const YOUR_DOMAIN = 'http://localhost:5175'

const products = new StripeProducts(stripe);

paymentRoutes.post('/payments/create-checkout-session', createPaymentSession as RequestHandler)
paymentRoutes.get('/payments/create-products', createProducts as RequestHandler)
paymentRoutes.post("/payment/create-portal-session", createPortalSession as RequestHandler)
paymentRoutes.post('/payments/verify', verifyPayment as unknown as RequestHandler)
paymentRoutes.post("/webhook", express.raw({ type: "application/json" }), webhook as RequestHandler)

export default paymentRoutes;