const userModel = require('../models/userModel');
const stripe = require('stripe')('sk_test_51PkRCvRwoQp7EuV9unlcieeGiuIuHLW5pzF35zNzCmO6R6jRFh1KxsdOH5yHeb86Qb99sz677oQyyRkAfvDpBYqn00SMeafDNI');
const checkoutSession = async (req, res) => {
  const { payment_method, amount, currency, success_url, cancel_url } = req.body;
  console.log(req.body);
  

  // Check if the amount is at least $70 (7000 cents)
  amountUSD = 7000/100
  if (amount < amountUSD) {
    return res.status(400).json({ error: 'The amount must be at least $70 to proceed with the subscription.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: [payment_method], // Ensure this matches one of the valid methods
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'Premium Photo Editing App Subscription',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
    });


    // Update User Model with Payment Details
    const userId = req.user.id;
    await userModel.findByIdAndUpdate(userId, {
      payment_method,
      amount,
      currency,
      success_url,
      cancel_url,
      stripeSessionId: session.id,
      confirm: false // assuming the payment is not confirmed yet
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};  

//webhook api
const stripeWebhook = async (request, response) => {
    console.log("In Webhook");
    const sig = request.headers["stripe-signature"];
    const signingSecret =  "whsec_b4903665afdcd9a5673295604661c23860e59e2f92aacc4f1f07e33e65b47e0b"
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        sig,
        signingSecret
       
        // sig,
        // "whsec_IH67EuA6mQFQ9SRjAzKdSw12dEtQ698M"
      );
    } catch (err) {
      console.log(err);
      return;
    }
    // Handle the event
    switch (event.type) {
      case "account.updated":
        const account = event.data.object;
        console.log(account.id);
        console.log(account.payouts_enabled);
        try {
          const user = await userModel.findOneAndUpdate(
            { stripeAccountId: account.id },
            {
              payoutsEnabled: account.payouts_enabled,
            },
            { new: true }
          );
          console.log("🚀 ~ user:", user);
        } catch (error) {
          console.log("🚀 ~ error:");
        }
        break;
      case "account.external_account.created":
        const externalAcc = event.data.object;
        let userr;
        try {
          userr = await userModel.findOne({
            stripeAccountId: externalAcc.account,
          });
        } catch (error) {
          console.log(error);
        }
  
        if (!userr) {
          console.log("No user exists with this connected account id");
        }
  
        try {
          userr.externalAccountId = externalAcc.id;
          await userr.save();
        } catch (error) {
          console.log(error);
        }
        break;
      default:
        console.log("Default Value");
    }
    response.status(200).end();
  };

  //subsription
  const stripesubscription = async (request, response) => {
    console.log("In Webhook");
    const sig = request.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        sig,
        "whsec_b4903665afdcd9a5673295604661c23860e59e2f92aacc4f1f07e33e65b47e0b"
      );
    } catch (err) {
      console.log(err);
      return;
    }
    // Handle the event
    switch (event.type) {
      case "customer.created":
        const customer = event.data.object;
        let userExists;
        try {
          userExists = await userModel.findOne(
            { email: customer.email }
          );
        } catch (er) {
          console.log(er);
        }
  
        console.log(userExists);
  
        if (!userExists) {
          console.log("NO user exists");
          return;
        }
  
        try {
          userExists.customer_id = customer.id;
          await userExists.save();
        } catch (er) {
          console.log(er);
        }
        break;
  
      case "customer.subscription.created":
        let subscription = event.data.object;
  
        let status = subscription.status;
        let customerId = subscription.customer;
        const sub = subscription.id;
        // console.log(Subscription status is ${status} 2.);
        let accountPlan, vibesPerDay;
        const planId = subscription.plan.id;
        if (planId === process.env.STRIPE_SECRET_KEY) {
          accountPlan = "starter";
        }
        else{
          console.log("erroorrrr", e)
        }
  
        try {
          const user = await userModel.findOne({ customer_id: customerId });
          user.account_plan = accountPlan;
          user.plan_id = planId;
          user.subscription_id = sub;
          user.subscription_status = status;
  
          await user.save();
          console.log(`Creating Statuus set to ${status}`);
        } catch (error) {
          console.log("Error Occured");
        }
  
  
        break;
      default:
        console.log("Default Value");
    }
    response.status(200).end();
  };



  module.exports = {checkoutSession, stripesubscription, stripeWebhook}