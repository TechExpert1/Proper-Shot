let otp = ''
const generateOtp = ()=>{
    var otp = Math.floor(1000 + Math.random() * 9000);
    return String(otp)
}
module.exports =  generateOtp