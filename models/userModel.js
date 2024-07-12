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
    phone_number:{
        type: String,
    },
    country:{
        type:'string',
    }, 
    profileImage: {
        type: String,
        default: ""
      }
}, {timestamps: true})

module.exports = mongoose.model('User', userModel);