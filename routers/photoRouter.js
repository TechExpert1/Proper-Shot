const express = require('express');
const photoRouter = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const multer = require("multer");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// multer setup
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});
// const photoController = require('../controllers/photoController');
const { createPhoto,getGalleryPhotos, getRecentPhotos,  deletePhoto, getAllEditedPhotos, updatephoto } = require('../controllers/photoController');
const authorizationMiddleware = require('../middlewares/myAuth');

//routes
photoRouter.post('/create', authorizationMiddleware, upload.single('file'),createPhoto);
photoRouter.get('/gallery', authorizationMiddleware, getGalleryPhotos);
photoRouter.get('/recent',authorizationMiddleware,  getRecentPhotos);
photoRouter.get('/all-edits',authorizationMiddleware,  getAllEditedPhotos);

photoRouter.delete('/delete/:id', authorizationMiddleware, deletePhoto)
photoRouter.put("/update/:id",updatephoto)


module.exports = photoRouter;
