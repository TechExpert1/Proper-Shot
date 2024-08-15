const express = require('express');
const photoRouter = express.Router();
// const photoController = require('../controllers/photoController');
const { createPhoto,getGalleryPhotos, getRecentPhotos, upload, deletePhoto, getAllEditedPhotos } = require('../controllers/photoController');
const authorizationMiddleware = require('../middlewares/myAuth');

//routes
photoRouter.post('/create', authorizationMiddleware, upload.single('file'),createPhoto);
photoRouter.get('/gallery', authorizationMiddleware, getGalleryPhotos);
photoRouter.get('/recent',authorizationMiddleware,  getRecentPhotos);
photoRouter.get('/all-edits',authorizationMiddleware,  getAllEditedPhotos);

photoRouter.delete('/delete/:id', authorizationMiddleware, deletePhoto)


module.exports = photoRouter;
