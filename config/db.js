const mongoose = require('mongoose')
require('dotenv').config()
const connection = mongoose.connect(process.env.DB_URL);
connection.then(()=>{
    console.log("Database Connected Successfully !");
}).catch((e)=>{
    console.log("Database Not Connected", e)
})
