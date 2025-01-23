const express = require('express');
const { stripeSubscriptionWebhook, createSubscription,cancelSubscription,confirmPayment } = require('../controllers/stripeWebHookController');

const stripeRouter = express.Router();
stripeRouter.post(
  "/webhook", 
  stripeSubscriptionWebhook
);
// Create subscription route
stripeRouter.post('/create-subscription', createSubscription);
stripeRouter.post('/cancel',cancelSubscription)
stripeRouter.post('/confirmpayment',confirmPayment)
module.exports = stripeRouter;
