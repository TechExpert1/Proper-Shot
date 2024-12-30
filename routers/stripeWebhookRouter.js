const express = require('express');
const { stripeSubscriptionWebhook, createSubscription } = require('../controllers/stripeWebHookController');

const stripeRouter = express.Router();
stripeRouter.post(
    "/webhook",
    express.raw({ type: "application/json" }), 
    stripeSubscriptionWebhook
  );
 
// Create subscription route
stripeRouter.post('/create-subscription', createSubscription);

module.exports = stripeRouter;
