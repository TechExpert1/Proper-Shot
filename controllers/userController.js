const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {sendPushNotification}=require("../utils/pushNotification")
const SecretKey = "hellonodejsfamilythisisoursecretkey";
const otpGenerate = require('../utils/otpGenerate.js');
const generateRandomString = require('../utils/generateRandomString');
const otpResetModel = require('../models/otpResetModel');
const accountMail = require("../utils/sendEmail");
const Notification = require('../models/Notification.js');



const normalizePhoneNumber = (phoneNumber) => {

  if (phoneNumber.startsWith('03')) {
    return phoneNumber.replace(/^03/, '+923');
  }
  if (phoneNumber.startsWith('+92')) {
    return phoneNumber;
  }
  return null;
};
//Signup
const userSignUp = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, confirmPassword, deviceToken } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const trimmedEmail = email.trim();
    const lowercaseEmail = trimmedEmail.toLowerCase();

    // Check if the phone number is already in use
    const existingPhoneNumberUser = await userModel.findOne({ phoneNumber });
    if (existingPhoneNumberUser) {
      return res.status(400).json({ message: "This phone number is already in use" });
    }

    // Check if the password length is at least 8 characters
    if (password.length < 8) {
      return res.status(400).json({ message: "Password should be at least 8 characters" });
    }

    // Validate if the password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if the email is already in use
    const existingUser = await userModel.findOne({ email: lowercaseEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new userModel({
      name,
      email: lowercaseEmail,
      phoneNumber,
      password: hashedPassword,
      deviceToken,
    });
    const saveUser = await newUser.save();
    const { password: _, ...userData } = saveUser._doc;
    const token = await jwt.sign({ email: saveUser.email, id: saveUser._id }, process.env.SecretKey, {
      expiresIn: "1d", // Set token expiration time
    });
    if (deviceToken) {
      const message = "Welcome to Proper Shot app! Your 3-day free trial starts now.";
      const title = "Welcome to Proper Shot!";
      const type = "WELCOME_NOTIFICATION";
      const params = { trialDays: 3 };

      sendPushNotification(deviceToken, title, message, type, params);
    }
    const notificationMessage = "Welcome to Proper Shot app! Your 3-day free trial starts now.";
    const notificationTitle = "Welcome to Proper Shot!";
    
    const newNotification = new Notification({
      recipient: saveUser._id,
      heading: notificationTitle,
      message: notificationMessage,
      params: { trialDays: 3 } 
    });

    // Save the notification in the database
    await newNotification.save();
    return res.status(200).json({ ...userData, token });
  } catch (error) {
    console.error("Error in userSignUp:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




//Loign the User
const userLogin = async (req, res) => {
    const {email} = req.body
    try {
        if(!email || !req.body.password) {
            return res.status(400).json({message: "Please enter all required information"})
        }
          const trimmedEmail = email.trim();
          const lowercaseEmail = trimmedEmail.toLowerCase();
       
          
        existingUser = await userModel.findOne({email: lowercaseEmail})
        if(!existingUser){
            return res.status(404).json({message:"User does not exist, please sign up first"})
        }
        const matchPassword = await bcrypt.compare(req.body.password, existingUser.password)
        if(!matchPassword){
            return res.status(400).json({message: "Invalid password"})
        }
        const { password, ...others } = existingUser._doc;
        const token = await jwt.sign({email:existingUser.email, id:existingUser._id},SecretKey)
                 
        return res.status(200).json({...others, token})
    } catch (error) {
      console.log("Error : ", error);
        return res.status(500).json({message: "Server error: " + error.message})
    }
}
// controller for getting single user detail
const find=async (req,res)=>{
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).json({ message: "Server error: " + error.message });
  }
}
//Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
      if(!email){
        return res.status(400).json({message:"Please enter an email"})
      }
        const trimmedEmail = email.trim();
        const lowercaseEmail = trimmedEmail.toLowerCase();
         const user = await userModel.findOne({
           email: lowercaseEmail
         });
      if (!user) {
        return res.status(401).json({error: "User does not exist by this email" });
      }
      await otpResetModel.deleteMany({ userId: user._id });
      const otp = otpGenerate();
      const resetOtp = new otpResetModel({
        userId: user.id,
        otp,
      });
      await resetOtp.save();
      await accountMail(user.email, "Reset Password OTP", otp);
      res.status(200).json({message: "Reset OTP Sent to your given email" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({
        code: 500,
        error: "Error while Requesting Password Reset Request ",
      });
        console.log("🚀 ~ res.status ~ error:", error)
    }
  };

//Verify OTP
const VerifyOTP = async (req, res) => {
    try {
      const resetOtp = await otpResetModel.findOne({ otp: req.body.otp });
      if (!resetOtp) {
        return res.status(404).json({message: "Invalid OTP" });
      }
      
      res.status(200).json({data: resetOtp });
    } catch (error) {
      res.status(500).json({error: "Server Error" });
    }
  };
//Reset Password
const resetPassword = async (req, res) => {
    const password = req.body.password;
    const resetOtp = await otpResetModel.findOne({
      otp: req.body.otp,
      // userId: req.body.userId,
    });
    if (!resetOtp) {
      return res.status(401).json({message: "Invalid OTP" });
    }
    // const salt = await bcrypt.genSalt(15);
    const hashpassword = await bcrypt.hash(password, 10);
    // console.log("aaaaaaaaaaaaaaaaaaaaaaa");
    try {
      await userModel.findByIdAndUpdate(resetOtp.userId, {
        $set: {
          password: hashpassword,
        },
      });
      await otpResetModel.deleteMany({ userId: resetOtp.userId });
      return res
        .status(200)
        .json({message: "Password Updated successfully" });
    } catch (error) {
        console.log(error);
      res.status(500).json({message: "Error While Reset Password" });
    }

  };
//Subscription Module
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const subscription = async(req, res)=>{
    try {
      const userId = groupid; // or any relevant user identifier

      // Fetch the current user record to get the wallet balance
      const user = await userModel.findById(userId);
      let balance = user.walletBalance;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: "usd",
        payment_method: "pm_card_visa",
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
      });
      
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Deduct the amount from wallet balance
        balance -= amount;
      
        // Update wallet balance and group status
        await userModel.findByIdAndUpdate(userId, {
          walletBalance: balance,
          isGroupActive: true
        });
      
        console.log("Payment successful and user model updated.");
      } else {
        console.log("Payment failed or not confirmed.");
      }
    } catch (error) {
      
    }
  }

module.exports = {userSignUp, userLogin, forgotPassword, VerifyOTP, resetPassword, subscription,find}