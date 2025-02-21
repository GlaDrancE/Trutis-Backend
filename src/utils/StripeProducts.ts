import Stripe from 'stripe';

export default class StripeProducts {
  private stripe: Stripe;

  constructor(stripe: Stripe) {
    this.stripe = stripe;
  }

  async createProduct(name: string, description: string, amount: number, intervalCount: number) {
    const product = await this.stripe.products.create({
      name,
      description,
    });

    const price = await this.stripe.prices.create({
      product: product.id,
      unit_amount: amount, 
      currency: 'inr', 
      recurring: { interval: 'month', interval_count: intervalCount },
    });

    return { ...product, default_price: price.id };
  }
}