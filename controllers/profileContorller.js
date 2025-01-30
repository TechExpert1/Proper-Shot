const userModel = require('../models/userModel')
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs')
const i18next =require("../config/i18n.js")
dotenv.config()

const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require('multer-s3');
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: process.env.AWS_REGION
})


// Multer configuration for file upload
const storage = multerS3({
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

//updating user details
const updateProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error:i18next.t('updateProfile.userNotFound') });
    }

    let updatedFields = {};
    if (req.file) {
      updatedFields.profileImage = req.file.location;
    }
    if (req.body.name) {
      updatedFields.name = req.body.name;
    }
    if (req.body.language) {
      updatedFields.language = req.body.language;
    }
    if (req.body.country) {
      updatedFields.country = req.body.country;
    }
    if (req.body.phoneNumber) {
      const phoneNumberExists = await userModel.findOne({
        phoneNumber: req.body.phoneNumber,
        _id: { $ne: req.user.id }
      });

      if (phoneNumberExists) {
        return res.status(400).json({ message:i18next.t('updateProfile.phoneNumberExists')});
      }
      updatedFields.phoneNumber = req.body.phoneNumber;
    }

    // Update password if provided
    if (req.body.password && req.body.confirmPassword) {
      if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message:i18next.t('updateProfile.passwordNotMatched')});
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      updatedFields.password = hashedPassword;
    }

    // If there are fields to update, proceed with update
    if (Object.keys(updatedFields).length > 0) {
      const updateUser = await userModel.findByIdAndUpdate(
        req.user.id,
        { $set: updatedFields },
        { new: true }
      );


      if (!updateUser) {
        return res.status(401).json({ code: 401, error: "User not found" });
      }

      const { password, ...other } = JSON.parse(JSON.stringify(updateUser));
      return res.status(200).json({ code: 200, message: i18next.t('updateProfile.userUpdated'),updateUser: { ...other } });
    } else {
      return res.status(400).json({ code: 400, message:i18next.t('updateProfile.noFieldsProvided')});
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, error:i18next.t('updateProfile.errorUpdating')});
  }
};



module.exports = { updateProfile, upload }
