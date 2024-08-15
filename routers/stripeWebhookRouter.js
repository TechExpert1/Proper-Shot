const express = require('express')
const authorizationMiddleware = require('../middlewares/myAuth');
const { stripeWebhook, stripesubscription, checkoutSession } = require('../controllers/stripeWebHookController');
const stripeRouter = express.Router()




//subscriptions
stripeRouter.post('/subscription', authorizationMiddleware, stripesubscription)
stripeRouter.post('/webhook', authorizationMiddleware, stripeWebhook)
stripeRouter.post('/create-checkout-session', authorizationMiddleware, checkoutSession)

module.exports = stripeRouter