const multer  = require('multer');
const dotenv =  require('dotenv');
const path = require('path');
dotenv.config()

const userModel = require('../models/userModel')
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require('multer-s3');
const s3 = new S3Client({
  credentials:{
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: process.env.AWS_REGION
})


// Multer configuration for file upload
const storage =   multerS3({
  s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now().toString()}${ext}`;
      cb(null, filename);
    },

    limits: {
      fileSize: 1024 * 1024 * 5 // 5 MB
    },
    fileFilter: function (req, file, cb) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'));
      }
    }
});
const upload = multer({ storage: storage });


//updating user profile...
const updateProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
          console.log("🚀 ~ exports.updateProfile= ~ req.user.id:", req.user.id)
          console.log("🚀 ~ exports.updateProfile= ~ user:", user)
          if (!user) {
              return res.status(404).json({ error: 'User not found' });
          }
          console.log(req.user.id);
    let updatedFields = req.body;
    if (req.file) {
             updatedFields.profileImage = req.file?.location
            }

    // if (req.file) {
    //   user.profileImage = req.file.location; // Use req.file.location to get the S3 file URL
    //   updatedFields.profileImage = req.file.location; // Include profileImage in updated fields
    // }
    console.log("🚀 ~ exports.updateProfile= ~ updatedFields:", updatedFields)

    const updateUser = await userModel.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields},
      { new: true }
    );
    console.log("🚀 ~ exports.updateProfile= ~ updateUser:", updateUser)
    if (!updateUser)
      return res.status(401).json({ code: 401, error: "User not found" });
    
    const {password, ...other} = JSON.parse(JSON.stringify(updateUser));

    res.status(200).json({ code: 200, message: "User updated successfully" ,updateUser:{...other}});
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, error: "Error While Updating Data" });
  }
};


module.exports = {updateProfile, upload}
