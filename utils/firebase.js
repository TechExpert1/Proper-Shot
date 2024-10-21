const admin = require("firebase-admin");
const serviceAccessKey=require('./propershot-techxpert-firebase-adminsdk-r0h6f-77f83e61bb.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccessKey),
});
module.exports = { admin };