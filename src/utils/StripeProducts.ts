import Stripe from 'stripe';
class StripeProducts {
  stripe: Stripe;
  constructor(stripe: Stripe) {
    this.stripe = stripe;
  }
  async createProduct(name: string, description: string, price: number, interval_count: number = 1, client_id: string) {
    const product = await this.stripe.products.create({
      name,
      description,
      images: ['https://via.placeholder.com/150'],
      default_price_data: {
        currency: 'inr',
        unit_amount: price,
        recurring: {
          interval: 'month',
          interval_count: interval_count,
        }
      },
    })
    return product;
  }
}

export default StripeProducts;