const express = require('express');
const { stripeSubscriptionWebhook, createSubscription } = require('../controllers/stripeWebHookController');

const stripeRouter = express.Router();
stripeRouter.post(
  "/webhook", 
  stripeSubscriptionWebhook
);
// Create subscription route
stripeRouter.post('/create-subscription', createSubscription);

module.exports = stripeRouter;
