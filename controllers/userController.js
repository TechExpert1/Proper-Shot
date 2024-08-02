const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SecretKey = "hellonodejsfamilythisisoursecretkey";
const otpGenerate = require('../utils/otpGenerate.js');
const generateRandomString = require('../utils/generateRandomString');
const otpResetModel = require('../models/otpResetModel');
const accountMail = require("../utils/sendEmail");



//Signup
const userSignUp = async (req, res)=>{
    try {
        const {name, email, phoneNumber, confirmPassword} = req.body;
        // if(!name || !email || phoneNumber || !req.body.password  || !req.body.confirmPassword){
        //     return res.status(400).json({message: "Please fill all the fields"})
        // }
        if(email !== email.toLowerCase()){
            return res.status(400).json({message: "Email must be in lowercase"})
        }
        if(phoneNumber.length === 11 || phoneNumber.length === 13){
          return res.status(400).json({message: "Invalid! Phone Number should be 11 or 13 digits "})
        }
        if(req.body.password .length < 8){
            return res.status(400).json({message: "Password should be at least 8 characters"})
        }
        if (req.body.password  !== confirmPassword){
            return res.status(400).json({message: "Password Not Matched"})
        }
        //Check if the user is already signed up
        const existingUser = await userModel.findOne({email: email.toLowerCase()})
        if(existingUser){
            return res.status(400).json({message: "Email already in use"})
        }
        //Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password , 10)
        //finally creating user in db
        const newUser = new userModel({
            name: name,
            email: email.toLowerCase(),
            phoneNumber: phoneNumber,
            password: hashedPassword,
            confirmPassword: hashedPassword
        })
        const saveUser = await newUser.save();
        const { password, ...others} = saveUser._doc 

        
        const token = await jwt.sign({email: saveUser.email, id: saveUser._id}, SecretKey)
        return res.status(200).json({message: "User Registered Successfully!", user: others, token})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal Server Eroor", error})
    }
}



//Loign the User
const userLogin = async (req, res) => {
    const {email} = req.body
    try {
        if(!email || !req.body.password) {
            return res.status(400).json({message: "Please enter all required information"})
        }
        existingUser = await userModel.findOne({email: email.toLowerCase()})
        if(!existingUser){
            return res.status(404).json({message:"User does not exist, please sign up first"})
        }
        const matchPassword = await bcrypt.compare(req.body.password, existingUser.password)
        if(!matchPassword){
            return res.status(400).json({message: "Invalid password"})
        }
        const { password, ...others } = existingUser._doc;
        const token = await jwt.sign({email:existingUser.email, id:existingUser._id},SecretKey)
        return res.status(200).json({message: "User Logged-In Successfully!", user: others, token})
    } catch (error) {
      console.log("Error : ", error);
        return res.status(500).json({message: "Server error: " + error.message})
    }
}



//Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
      const user = await userModel.findOne({
        email: email.toLowerCase(),
      });
      if (!user) {
        return res.status(401).json({error: "Invalid Email" });
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




module.exports = {userSignUp, userLogin, forgotPassword, VerifyOTP, resetPassword}