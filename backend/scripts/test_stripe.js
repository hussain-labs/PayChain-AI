import dotenv from 'dotenv';
import Stripe from 'stripe';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function run() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Test' },
          unit_amount: 1000,
          recurring: { interval: 'month' }
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'http://localhost/success',
      cancel_url: 'http://localhost/cancel',
    });
    console.log("Success! URL:", session.url);
  } catch (error) {
    console.error("Stripe Error:", error.message);
  }
}
run();
