const mongoose = require('mongoose')
const OtpResetSchema = mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    
    otp : {
        type : String,
        required : true
    },
})
module.exports = mongoose.model("OtpReset",OtpResetSchema);