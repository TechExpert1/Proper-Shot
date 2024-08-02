const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isEdited: { type: Boolean, default: false },
  // createdAt: { type: Date, default: Date.now },
  // editedAt: { type: Date, default: null },
  picture_url: {type: String},
},
{timestamps: true});

module.exports = mongoose.model("Photo", photoSchema);
