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

const createSubscription = async (req, res) => {
  const { name, email, paymentMethodId } = req.body;

  if (!name || !email || !paymentMethodId) {
    return res.status(400).json({ message: 'Name, email, and payment method ID are required.' });
  }

  try {
    // Create Stripe customer
    const customer = await stripe.customers.create({
      name,
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_STARTER_API }],
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });
    const currentDate = new Date();
    const expirationDate = new Date(currentDate.setDate(currentDate.getDate() + 30));
    const user = await User.findOneAndUpdate(
      { email }, 
      {
        stripeAccountId: customer.id,
        subscription_id: subscription.id,
        subscription_status: subscription.status,
        expiresIn: expirationDate, // Set the expiration date
      },
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found. Subscription created without linking to a user.' });
    }

    res.status(200).json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      customer_id: customer.id,
      subscription_id: subscription.id,
      subscription_status: subscription.status,
      expiresIn: user.expiresIn,
    });
  } catch (error) {
    console.error(`Error creating subscription: ${error.message}`);
    res.status(500).json({
      message: 'Subscription creation failed',
      error: error.message,
      stack: error.stack,
    });
  }
};
// get payment intent
// export const getPaymentIntent = async (req, res) => {
//   try {
//     const { paymentIntentId } = req.query;
//     if (!paymentIntentId) {
//       return res.status(400).json({ message: 'Payment Intent ID is required.' });
//     }
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
//     res.status(200).json(paymentIntent);
//   }
//   catch (error) {
//     console.error(`Error getting payment intent: ${error.message}`);
//     res.status(500).json({
//       message: 'Payment intent retrieval failed',
//       error: error.message,
//       stack: error.stack,
//     });
//   }
// }
// cancel subscription
const cancelSubscription = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user || !user.subscription_id) {
      return res.status(404).json({ message: 'User or subscription not found.' });
    }

    // Cancel the subscription
    // const canceledSubscription = await stripe.subscriptions.del(user.subscription_id);

    // if (!canceledSubscription) {
    //   throw new Error('Failed to cancel subscription. Stripe did not return a valid response.');
    // }

    // Update user subscription status
    user.subscription_status = 'canceled';
    user.subscription_id = ''; 
    await user.save();

    res.status(200).json({
      message: 'Subscription canceled successfully.',
      // subscription: canceledSubscription,
    });
  } catch (error) {
    console.error(`Error canceling subscription: ${error.message}`);
    res.status(500).json({
      message: 'Subscription cancellation failed.',
      error: error.message,
      stack: error.stack,
    });
  }
};





module.exports = {
  stripeSubscriptionWebhook,
  createSubscription,
  cancelSubscription
};