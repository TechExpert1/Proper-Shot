const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const User = require('../models/userModel');

const stripeSubscriptionWebhook = async (req, res) => {
  try {
    console.log('Headers:', req.headers);
    
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      console.error('Missing Stripe signature header.');
      return res.status(400).send('Webhook Error: Missing stripe-signature header.');
    }

    console.log('Raw Body:', req.body);

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      console.log('Stripe Event:', event);
    } catch (err) {
      console.error(`Webhook Signature Verification Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.created': {
        const customer = event.data.object;
        try {
          const user = await User.findOne({ email: customer.email });
          if (user) {
            user.stripeAccountId = customer.id;
            await user.save();
            console.log(`Stripe customer ID saved for user: ${user.email}`);
          } else {
            console.log('No user found for the given email.');
          }
        } catch (error) {
          console.error(`Error handling customer.created: ${error.message}`);
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        try {
          const user = await User.findOne({ stripeAccountId: subscription.customer });
          if (user) {
            user.subscription_id = subscription.id;
            user.subscription_status = subscription.status;
            await user.save();
            console.log(`Subscription created for user: ${user.email}`);
          } else {
            console.log('No user found for the given Stripe customer ID.');
          }
        } catch (error) {
          console.error(`Error handling customer.subscription.created: ${error.message}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Respond with a 200 to acknowledge receipt of the event
    res.status(200).end();
  } catch (err) {
    console.error('Unexpected Error:', err.message);
    res.status(500).send('Internal Server Error');
  }
};

const createSubscription = async (name, email, paymentMethodId) => {
  try {
    const customer = await stripe.customers.create({
      name,
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_STARTER_API }],
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    return {
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      customer_id: customer.id,
      subscription_id: subscription.id,
      subscription_status: subscription.status,
    };
  } catch (error) {
    console.error(`Error creating subscription: ${error.message}`);
    throw new Error('Subscription creation failed');
  }
};

module.exports = {
  stripeSubscriptionWebhook,
  createSubscription,
};