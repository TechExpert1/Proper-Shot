const express = require('express');
const userRouter = require('./routers/userRouter.js');
const profileRouter = require('./routers/profileRouter.js');
const photoRouter = require('./routers/photoRouter.js');
const stripeRouter = require('./routers/stripeWebhookRouter.js')
const app = express();
require('./config/db.js')
require('dotenv').config()

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}))

app.use('/auth/user/', userRouter)
app.use('/auth/user/', profileRouter)

app.use('/api/photos', photoRouter);
app.use('/api/user/', stripeRouter)
const port = process.env.PORT || 8888
app.listen(port, ()=>{
    console.log(`Server is listening on port:  ${port}`)
})