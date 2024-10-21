const { admin } = require("./firebase.js");

const iconUrl = "";

function sendPushNotification(deviceToken, title, message, type, params) {
  let payload = {
    notification: {
      title,
      body: message,
    },
    token: deviceToken,
    data: {
      type,
      params: JSON.stringify(params),
    },
  };

  admin
    .messaging()
    .send(payload)
    .then((response) => {
      console.log("Push notification sent successfully");
    })
    .catch((error) => {
      console.error("Error sending push notification:", error.message);
    });
}
module.exports = { sendPushNotification };
