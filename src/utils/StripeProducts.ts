import Stripe from 'stripe';
<<<<<<< HEAD
class StripeProducts {
  stripe: Stripe;
=======

export default class StripeProducts {
  private stripe: Stripe;

>>>>>>> 703d4101190a89291feeb07e9bf0c321a27e14a6
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