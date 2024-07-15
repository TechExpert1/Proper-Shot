const AWS = require('aws-sdk');
const multer  = require('multer');
const uuid = require('uuid'); // To generate unique identifiers for your S3 objects
const Photo = require('../models/photoModel'); // Make sure to adjust the path to your Photo model
const dotenv =  require('dotenv');
const path = require('path');
dotenv.config()
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();



// const Photo = require('../models/photoModel');
// const uuid = require('uuid'); // To generate unique identifiers for your S3 objects
// const multer  = require('multer');
// const dotenv =  require('dotenv');
// const path = require('path');
// dotenv.config()

// const userModel = require('../models/userModel')
// const { S3Client } = require("@aws-sdk/client-s3");
// const multerS3 = require('multer-s3');
// const s3 = new S3Client({
//   credentials:{
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//   },
//   region: process.env.AWS_REGION
// })
// // Multer configuration for file upload
// const storage =   multerS3({
//   s3: s3,
//     bucket: process.env.S3_BUCKET_NAME,
//     metadata: function (req, file, cb) {
//         cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       const ext = path.extname(file.originalname);
//       const filename = `${Date.now().toString()}${ext}`;
//       cb(null, filename);
//     },

//     limits: {
//       fileSize: 1024 * 1024 * 5 // 5 MB
//     },
//     fileFilter: function (req, file, cb) {
//       const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
//       if (allowedMimeTypes.includes(file.mimetype)) {
//         cb(null, true);
//       } else {
//         cb(new Error('Invalid file type'));
//       }
//     }
// });
// const upload = multer({ storage: storage });

///
const getGalleryPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({});
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getRecentPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({ isRecent: true });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.createPhoto = async (req, res) => {
//   try {
//     const { url } = req.body;
//     const photo = new Photo({ url });
//     await photo.save();
//     res.status(201).json(photo);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const createPhoto = async (req, res) => {
  try {
    // const { file } = req.file; // Assuming the photo is sent as a file in the request
    console.log("🚀 ~ createPhoto ~ file:", req.file)

    // Generate a unique key for the photo
    const key = `photos/${uuid.v4()}_${req.file.originalname}`;

    console.log("🚀 ~ createPhoto ~ file.originalname:", req.file.originalname)
    console.log("🚀 ~ exports.createPhoto= ~ key:", key)
    // Set up S3 upload parameters
    const params = {
      Bucket: process.env.S3_BUCKET_NAME, // Replace with your S3 bucket name
      Key: key,
      Body: req.file.buffer, // Assuming file.buffer contains the binary data of the photo
      ContentType: req.file.mimetype, // The MIME type of the file
      ACL: 'public-read', // Adjust the ACL as per your requirements
    };

    // Upload the photo to S3
    const uploadResult = await s3.upload(params).promise();

    // Save the S3 URL to the database
    const photo = new Photo({ url: uploadResult.Location });
    await photo.save();
   
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const storage = multer.memoryStorage();
const upload = multer({ storage });


module.exports = {createPhoto, getRecentPhotos, getGalleryPhotos, upload}