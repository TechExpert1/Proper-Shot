const admin = require("firebase-admin");
const serviceAccessKey=require('./propershot-techxpert-firebase-adminsdk-r0h6f-d08b4c51b6.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccessKey),
});
module.exports = { admin };
