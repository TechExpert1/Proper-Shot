const express = require('express');
const { stripeSubscriptionWebhook, createSubscription,cancelSubscription,confirmPayment } = require('../controllers/stripeWebHookController');
const authorizationMiddleware = require('../middlewares/myAuth');

const stripeRouter = express.Router();
stripeRouter.post(
  "/webhook", 
  stripeSubscriptionWebhook
);
// Create subscription route
stripeRouter.post('/create-subscription', createSubscription);
stripeRouter.post('/cancel',authorizationMiddleware,cancelSubscription)
stripeRouter.post('/confirmpayment',authorizationMiddleware,confirmPayment)
module.exports = stripeRouter;
