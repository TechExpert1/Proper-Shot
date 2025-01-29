const express = require('express');
const cors = require("cors");
const userRouter = require('./routers/userRouter.js');
const profileRouter = require('./routers/profileRouter.js');
const photoRouter = require('./routers/photoRouter.js');
const stripewebhook = require("./routers/stripeWebhookRouter.js");
const notificationRouter = require('./routers/notification.js');
const i18next = require('./config/i18n.js');

const app = express();
require('./config/db.js');
require('dotenv').config();

app.use(express.json());
app.use("/api/createwebhook", express.raw({ type: 'application/json' }), stripewebhook);
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Middleware to set the language based on `Accept-Language` header
// app.use((req, res, next) => {
//   const lng = req.headers['accept-language']?.split(',')[0] || 'en'; // Default to 'en' if no header
//   i18next.changeLanguage(lng);
//   req.t = i18next.t.bind(i18next); // Attach translation function to request object
//   next();
// });

// Routes
app.use('/auth/user/', userRouter);
app.use('/auth/user/', profileRouter);
app.use('/api/photos', photoRouter);
app.use('/api/stripe', stripewebhook);
app.use('/api/notification', notificationRouter);

// Example Route Using Translation
app.get('/api/greeting', (req, res) => {
  res.json({ message: req.t('welcome') });
});

const port = process.env.PORT || 8888;
app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});
