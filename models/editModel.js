const mongoose = require('mongoose');

const editSchema = new mongoose.Schema({
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  },

  editedAt: {
    type: Date,
    default: Date.now
  }
});

const Edit = mongoose.model('Edit', editSchema);

module.exports = Edit;
