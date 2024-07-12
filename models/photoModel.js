const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  
  url: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  isRecent: {
    type: Boolean,
    default: false
  }
});

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;
