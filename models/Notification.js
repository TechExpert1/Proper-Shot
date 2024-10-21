const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Buddy',
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    heading: {
        type: String,
    },
    message: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    },
    params: {
        type: Object,  // Use Object to store key-value pairs like bookId and rentRequestId
        default: {},
    }

}, {
    timestamps: true
});
module.exports = mongoose.model("Notification", NotificationSchema)