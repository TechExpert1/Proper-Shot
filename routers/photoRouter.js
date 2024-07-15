const express = require('express');
const photoRouter = express.Router();
// const photoController = require('../controllers/photoController');
const { createPhoto,getGalleryPhotos, getRecentPhotos, upload } = require('../controllers/photoController');

//routes
photoRouter.post('/create', upload.single('file'),createPhoto);
photoRouter.get('/gallery', getGalleryPhotos);
photoRouter.get('/recent', getRecentPhotos);


module.exports = photoRouter;
