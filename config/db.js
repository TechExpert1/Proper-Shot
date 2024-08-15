const mongoose = require('mongoose')
const connection = mongoose.connect("mongodb+srv://dookappmongo:rR6vlkRT62712K0x@cluster0.yat0y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
connection.then(()=>{
    console.log("Database Connected Successfully !");
}).catch((e)=>{
    console.log("Database Not Connected", e)

})
