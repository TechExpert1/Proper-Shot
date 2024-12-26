const stripe = require('stripe')('sk_test_51QZX88Rt6g1B7np604OwJ1bXwRidn7Ji8zASF1Qrpvo6gOXnfakZR34pQL7vL5mlrQjxjFzspLtfD77hQ6LNfpJd00aYEVEj37');
const userModel = require('../models/userModel');

const stripeSubscriptionWebhook = async (request, response, next) => {
  const sig = request.headers["stripe-signature"];
  const webhookSecret = "whsec_DPDiu3fYxDlOMG5u1eiGLQsDoTy74kJI"; 
  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "customer.created":
      try {
        const customer = event.data.object;
        const user = await userModel.findOne({ email: customer.email });

        if (!user) {
          console.log("No user exists with the provided email");
          return response.status(404).send("User not found");
        }

        user.stripeAccountId = customer.id;
        await user.save();
        console.log(`Stripe customer ID updated for user: ${user.email}`);
      } catch (err) {
        console.error(`Error updating stripeAccountId: ${err.message}`);
      }
      break;

    case "customer.subscription.created":
      try {
        const subscription = event.data.object;
        const user = await userModel.findOne({ stripeAccountId: subscription.customer });

        if (!user) {
          console.log("No user found with the given Stripe customer ID");
          return response.status(404).send("User not found");
        }

        user.subscription_id = subscription.id;
        user.subscription_status = subscription.status;
        await user.save();
        console.log(`Subscription created for user: ${user.email}, Status: ${subscription.status}`);
      } catch (err) {
        console.error(`Error updating subscription details: ${err.message}`);
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  response.status(200).end();
};

const createSubscription = async (name, email, paymentMethodId, priceAPIId) => {
  try {
    const customer = await stripe.customers.create({
      name: name,
      email: email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceAPIId }],
      payment_settings: {
        payment_method_options: {
          card: {},
        },
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });

    return {
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      customer_id: subscription.customer,
      subscriptionStatus: subscription.status,
    };
  } catch (error) {
    console.error(`Error creating subscription: ${error.message}`);
    return { error: new Error("Failed to create subscription") };
  }
};

module.exports = {
  createSubscription,
  stripeSubscriptionWebhook,
};