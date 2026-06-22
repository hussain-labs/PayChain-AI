import Stripe from 'stripe';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { notifyUser, notifyAdmins } from '../utils/notify.js';

// Use process.env.STRIPE_SECRET_KEY in production
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16'
});

// Create Stripe Checkout Session for upgrading
export const createCheckoutSession = async (req, res) => {
  try {
    const { plan, extraWallets } = req.body;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    let lineItems = [];
    let metadata = { userId: user._id.toString(), plan: plan };

    if (plan === 'pro') {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Business Pro Plan',
            description: 'Up to 10 wallets, 1000 transactions/month',
          },
          unit_amount: 2900, // $29.00
          recurring: { interval: 'month' }
        },
        quantity: 1,
      });
    } else if (plan === 'pro_plus') {
      // Dynamic pricing for Pro Plus based on number of extra wallets
      const basePrice = 9900; // $99.00 base for enterprise
      const additionalWalletPrice = 500; // $5.00 per extra wallet above 10
      const totalExtraWallets = extraWallets || 0;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Enterprise Custom Plan',
            description: `Unlimited transactions + ${totalExtraWallets} extra wallets`,
          },
          unit_amount: basePrice + (additionalWalletPrice * totalExtraWallets),
          recurring: { interval: 'month' }
        },
        quantity: 1,
      });
      metadata.extraWallets = totalExtraWallets.toString();
    } else {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pricing`,
      customer_email: user.email,
      metadata: metadata
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
};

// Handle Stripe Webhook
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // You need to configure this secret in your .env
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';
    // Use raw body for webhook verification
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    if (session.metadata && session.metadata.userId && session.metadata.plan) {
      try {
        const user = await User.findById(session.metadata.userId);
        if (user) {
          user.plan = session.metadata.plan;
          user.stripeCustomerId = session.customer;
          user.stripeSubscriptionId = session.subscription;
          user.transactionCount = 0; // Reset limit immediately upon new purchase
          await user.save();
          console.log(`User ${user._id} upgraded to ${user.plan} and limits reset`);

          // Notifications
          const planName = user.plan === 'pro_plus' ? 'Enterprise' : 'Business Pro';
          await notifyUser(user._id, `Your subscription has been successfully upgraded to ${planName}!`, '/settings');
          await notifyAdmins(`User upgraded plan to ${planName}: ${user.email}`, `/admin/users/${user._id}`);
        }
      } catch (error) {
        console.error('Error updating user plan after successful payment:', error);
      }
    }
  }

  // Handle monthly subscription renewal payment (Stripe bills them automatically next month)
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
      try {
        const user = await User.findOne({ stripeSubscriptionId: invoice.subscription });
        if (user) {
          user.transactionCount = 0; // Monthly limit reset!
          await user.save();
          console.log(`User ${user._id} limits reset for new billing cycle`);
        }
      } catch (error) {
        console.error('Error resetting user limits on renewal:', error);
      }
    }
  }

  res.json({ received: true });
};
