const userModel = require('../models/userModel')
const multer  = require('multer');
const dotenv =  require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs')
dotenv.config()

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

//updating user details
const updateProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    console.log("🚀 ~ exports.updateProfile= ~ req.user.id:", req.user.id);
    console.log("🚀 ~ exports.updateProfile= ~ user:", user);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let updatedFields = {};

    // Update profile image if provided
    if (req.file) {
      updatedFields.profileImage = req.file.location;
    }

    // Update name if provided
    if (req.body.name) {
      updatedFields.name = req.body.name;
    }

    // Update country if provided
    if (req.body.country) {
      updatedFields.country = req.body.country;
    }

    // Update phone number if provided
    if (req.body.phoneNumber) {
      if (req.body.phoneNumber.length !== 11 && req.body.phoneNumber.length !== 13) {
        return res.status(400).json({ message: "Invalid! Phone Number should be 11 or 13 digits" });
      }
      updatedFields.phoneNumber = req.body.phoneNumber;
    }

    // Update password if provided
    if (req.body.password && req.body.confirmPassword) {
      if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: "Password Not Matched" });
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
      console.log("🚀 ~ exports.updateProfile= ~ updateUser:", updateUser);

      if (!updateUser) {
        return res.status(401).json({ code: 401, error: "User not found" });
      }
      
      const { password, ...other } = JSON.parse(JSON.stringify(updateUser));
      return res.status(200).json({ code: 200, message: "User updated successfully", updateUser: { ...other } });
    } else {
      return res.status(400).json({ code: 400, message: "No fields provided for update" });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, error: "Error While Updating Data" });
  }
};



module.exports = {updateProfile, upload}
