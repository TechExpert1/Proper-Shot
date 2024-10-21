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
    phoneNumber:{
        type: String,
        maxlength: 13,
        minlength: 11
    },
    country:{
        type:'string',
    }, 
    profileImage: {
        type: String,
        default: ""
      },

    // Subscription
    stripeAccountId: {
        type: String
    },
    payoutsEnabled: {
        type: Boolean
    },
    externalAccountId: {
        type: String
    },
    account_plan: {
        type: String,
    },
    plan_id: {
        type: String
    },
    subscription_id: {
        type: String
    },
    subscription_status: {
        type: String
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
    success_url: {
        type: String,
    },
    cancel_url: {
        type: String,
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
    }

}, {timestamps: true});

module.exports = mongoose.model('User', userModel);