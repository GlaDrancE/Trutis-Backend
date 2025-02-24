import { stripe } from '../controllers/paymentController';
import prisma from '../db/prisma';
import { Stripe } from 'stripe';
import { generatePublicKey } from './publicKey';
import { generateRandom } from './generateRand';

interface StripeSubscription {
    id: string;
    customer: string;
    status: string;
    cancel_at_period_end: boolean;
    current_period_end: number;
    canceled_at: number | null;
    collection_method: string;
    currency: string;
    items: {
        data: Array<{
            plan: {
                id: string;
                product: string;
            };
        }>;
    };
}

interface StripeInvoice {
    id: string;
    amount_paid: number;
    customer: string;
    created: number;
}

/**
 * Handle a successful payment:
 * Create a new payment record in ClientPayments.
 */
async function handlePaymentSuccess(invoice: Stripe.Invoice) {
    const { id: invoiceId, amount_paid, customer, created, metadata } = invoice;
    const paymentDate = new Date(created * 1000);
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    const clientId = subscription.metadata?.client_id as string;

    console.log(subscription?.customer)
    console.log(subscription?.id)
    try {
        const subData = await prisma.subscriptions.findFirst({
            where: {
                subscription_id: subscription.id as string,
                customer_id: customer as string
            }
        })

        console.log(subData)
        if (!subData) {
            console.log("No subscription data found")
            return
        }

        const payment = await prisma.clientPayments.create({
            data: {
                Client: {
                    connect: {
                        id: clientId
                    }
                },
                Subscription: {
                    connect: {
                        id: subData.id as string
                    }
                },
                amount: amount_paid / 100,
                payment_date: paymentDate,
                payment_type: 'card',
                status: 'completed',
                invoice_id: invoiceId,
                stripe_customer_id: typeof customer === 'string' ? customer : null,
                transaction_id: invoice.id,
                product_id: subscription.items.data[0].plan.product as string,
                city: invoice.customer_address?.city || '',
                state: invoice.customer_address?.state || '',
                zip: invoice.customer_address?.postal_code || '',
                country: invoice.customer_address?.country || '',
                line1: invoice.customer_address?.line1 || '',
                line2: invoice.customer_address?.line2 || ''
            },
        });
        console.log(`Payment record created: ${payment.id}`);
    } catch (error) {
        console.error('Error creating payment record:', error);
    }
}

/**
 * Handle a failed payment:
 * Update payment record status to 'failed' (if an existing record exists).
 */
async function handlePaymentFailure(invoice: Stripe.Invoice) {
    try {
        const updated = await prisma.clientPayments.updateMany({
            where: { invoice_id: invoice.id },
            data: { status: 'failed' },
        });
        console.log(`Updated payment record for invoice ${invoice.id} to 'failed'`);
    } catch (error) {
        console.error('Error updating payment record:', error);
    }
}

/**
 * Handle an invoice creation event.
 * Depending on your business logic, you might create a pending payment record here.
 */
async function handleInvoiceCreated(invoice: Stripe.Invoice) {
    console.log(`Invoice created: ${invoice.id}`);
}

/**
 * Handle a new subscription creation.
 * Create a new subscription record in your Subscriptions table.
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
        const {
            id: subscriptionId,
            customer,
            status,
            cancel_at_period_end,
            current_period_end,
            canceled_at,
            collection_method,
            currency,
            items,
        } = subscription;
        console.log(subscription)
        const periodEnd = current_period_end ? new Date(current_period_end * 1000) : null;
        const canceledAt = canceled_at ? new Date(canceled_at * 1000) : null;

        const newSub = await prisma.subscriptions.create({
            data: {
                subscription_id: subscriptionId,
                customer_id: customer as string,

                interval: subscription.items.data[0].plan.interval,
                interval_count: subscription.items.data[0].plan.interval_count,
                plan_id: subscription.items.data[0].plan.id,

                isActive: status === 'active' || status === 'trialing',
                product_id: subscription.items.data[0].plan.product as string,
                subscription_status: status,
                collection_method: collection_method || '',
                currency: currency || '',
                cancel_at_period_end,
                current_period_end: periodEnd,
                canceled_at: canceledAt,
            },
        });
        console.log("Creating newSub: ", newSub)
        if (newSub) {

            const client = await prisma.clients.update({
                where: {
                    id: subscription.metadata?.client_id as string
                },
                data: {
                    isActive: true,
                    public_key: generateRandom(8),
                    customer_id: customer as string
                }
            })
            console.log("Updated client: ", client)
        }

    } catch (error) {
        console.error('Error creating subscription record:', error);
    }
}

/**
 * Handle subscription updates.
 * Update your subscription record based on changes from Stripe.
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
        const {
            id: subscriptionId,
            status,
            cancel_at_period_end,
            current_period_end,
            canceled_at,
        } = subscription;
        const periodEnd = current_period_end ? new Date(current_period_end * 1000) : null;
        const canceledAt = canceled_at ? new Date(canceled_at * 1000) : null;

        const updatedSub = await prisma.subscriptions.update({
            where: { subscription_id: subscriptionId },
            data: {
                subscription_status: status,
                isActive: status === 'active',
                cancel_at_period_end,
                current_period_end: periodEnd,
                canceled_at: canceledAt,
            },
        });
        if (updatedSub) {
            await prisma.clients.update({
                where: {
                    customer_id: subscription.customer as string
                },
                data: {
                    isActive: true,
                }
            })
        }
        console.log(`Subscription updated: ${updatedSub.subscription_id}`);
    } catch (error) {
        console.error('Error updating subscription record:', error);
    }
}

/**
 * Handle subscription cancellation.
 * Mark the subscription as inactive and update the cancellation timestamp.
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    try {
        const { id: subscriptionId, canceled_at } = subscription;
        const canceledAt = canceled_at ? new Date(canceled_at * 1000) : new Date();
        const updatedSub = await prisma.subscriptions.update({
            where: { subscription_id: subscriptionId },
            data: {
                isActive: false,
                subscription_status: 'canceled',
                canceled_at: canceledAt,
            },
        });
        console.log(`Subscription canceled: ${updatedSub.subscription_id}`);
        await prisma.clients.update({
            where: {
                customer_id: subscription.customer as string
            },
            data: { isActive: false }
        })
    } catch (error) {
        console.error('Error canceling subscription record:', error);
    }
}

export {
    handlePaymentSuccess,
    handlePaymentFailure,
    handleInvoiceCreated,
    handleSubscriptionCreated,
    handleSubscriptionUpdated,
    handleSubscriptionCanceled,
};

