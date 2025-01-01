const express = require('express');
const { stripeSubscriptionWebhook, createSubscription,cancelSubscription } = require('../controllers/stripeWebHookController');

const stripeRouter = express.Router();
stripeRouter.post(
  "/webhook", 
  stripeSubscriptionWebhook
);
// Create subscription route
stripeRouter.post('/create-subscription', createSubscription);
stripeRouter.post('/cancel',cancelSubscription)
module.exports = stripeRouter;
