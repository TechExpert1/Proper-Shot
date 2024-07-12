const express = require('express');
const photoRouter = express.Router();
const photoController = require('../controllers/photoController');

photoRouter.get('/gallery', photoController.getGalleryPhotos);
photoRouter.get('/recent', photoController.getRecentPhotos);
photoRouter.post('/create', photoController.createPhoto);

module.exports = photoRouter;
