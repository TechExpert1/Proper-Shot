const nodemailer = require('nodemailer');
const dotenv =  require('dotenv');
dotenv.config()
const accountMail = async (email,subject,text)=>{
    const transport = nodemailer.createTransport({
        service : 'gmail',
        host : "smtp.gmail.com",
        port : 465,
        auth : {
             user : process.env.SENDER_EMAIL,
             pass : process.env.SENDER_EMAIL_PASSWORD
        }
    })
    const mailOptions = {
        from : process.env.SENDER_EMAIL,
        to : email,
        subject,
        html : `
        <h1>Please Use this OTP to Verify Your Account</h1>
        <h2><b>${text}</b></h2>
        `
    }
    transport.sendMail(mailOptions,(err)=>{
        if(err){
            console.log(err);
        }
    })
}



module.exports =  accountMail;