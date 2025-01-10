const express = require('express');
const cors = require("cors");
const userRouter = require('./routers/userRouter.js');
const profileRouter = require('./routers/profileRouter.js');
const photoRouter = require('./routers/photoRouter.js');
const stripewebhook=require("./routers/stripeWebhookRouter.js")
const notificationRouter = require('./routers/notification.js');
const app = express();
require('./config/db.js')
require('dotenv').config()

//Middlewares
app.use(express.json());
app.use("/api/createwebhook", express.raw({ type: 'application/json' }), stripewebhook);
app.use(express.urlencoded({extended: false}))
app.use(cors());
app.use('/auth/user/', userRouter)
app.use('/auth/user/', profileRouter)
app.use('/api/photos', photoRouter);
app.use('/api/photos', photoRouter);
app.use('/api/stripe',stripewebhook)
app.use('/api/notification',notificationRouter)
const port = process.env.PORT || 8888
app.listen(port, ()=>{
    console.log(`Server is listening on port:  ${port}`)
})