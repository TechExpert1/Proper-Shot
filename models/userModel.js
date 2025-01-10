const mongoose = require('mongoose');
const userModel = mongoose.Schema({
    
    name:{
        type: 'string',
        required: 'true',
    },
    email:{
        type: 'string',
        required: 'true',
        unique: 'true',
        lowercase:'true'
    },
    password:{
        type: 'string',
        required: 'true',
        minlength:8
    },
    trialstartin:{
        type: Date,
        default: Date.now(),
    },
    trialendin:{
        type: Date,
        default: null,
    },
    phoneNumber:{
        type: String,
    },
    country:{
        type:'string',
        default:""
    }, 
    countrycode:{
        type:"String",
        default:"+91",
    },
    profileImage: {
        type: String,
        default: ""
      },

    // Subscription
    stripeAccountId: {
        type: String,
        default:"",
    },
    payoutsEnabled: {
        type: Boolean,
        default: false
    },
    externalAccountId: {
        type: String,
        default:"",
    },
        
    account_plan: {
        type: String,
        default:""
    },
    plan_id: {
        type: String,
        default:""
    },
    subscription_id: {
        type: String,
        default:""
    },
    isAdmin:{
        type: Boolean,
        default: false,
    },
    subscription_status: {
        type: String,
        default:"trial"
    },

    // Payment Details
    amount: {
        type: Number,
    },
    currency: {
        type: String,
    },
    payment_method: {
        type: String,
    },
    payment_type: {
        type: String,
        default: 'one-time',
    },
    expiresIn:{
        type:Date,
        default: null,

    },
    success_url: {
        type: String,
        default:null,
    },
    cancel_url: {
        type: String,
        default:null,
    },
    stripeSessionId: {
        type: String,
    },
    confirm: {  
        type: Boolean,
    },
    automatic_payment_methods: {
        enabled: {
            type: Boolean
        },
        allow_redirects: {
            type: String,
        }
    },
    deviceToken:{
        type:String,
        default:""
    },
    account_type: { type: String, default: "" },

}, {timestamps: true});

module.exports = mongoose.model('User', userModel);