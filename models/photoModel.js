const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const photoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isEdited: { type: Boolean, default: false },
 
  picture_url: {type: String},
},
{timestamps: true});
photoSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Photo", photoSchema);
