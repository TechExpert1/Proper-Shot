const express = require('express')
const {userLogin, userSignUp, forgotPassword, VerifyOTP, resetPassword  } = require('../controllers/userController');
const authorizationMiddleware = require('../middlewares/myAuth');
// const authorizationMiddleware = require('../middlewares/myAuth');
// const subscription = require('../controllers/subscriptionController');
const userRouter = express.Router()

//user 
userRouter.post('/signup', userSignUp)
userRouter.post('/login', userLogin);


//password routes
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/verify-otp', VerifyOTP);
userRouter.post('/reset-password', resetPassword);

module.exports = userRouter