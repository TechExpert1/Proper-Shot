const mongoose = require('mongoose')
const connection = mongoose.connect("mongodb://127.0.0.1:27017/Proper_Shot");
connection.then(()=>{
    console.log("Database Connected Successfully !");
}).catch((e)=>{
    console.log("Database Not Connected", e)

})