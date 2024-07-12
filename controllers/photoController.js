const Photo = require('../models/photoModel');

exports.getGalleryPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({});
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getRecentPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({ isRecent: true });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPhoto = async (req, res) => {
  try {
    const { url } = req.body;
    const photo = new Photo({ url });
    await photo.save();
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
