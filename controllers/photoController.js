const photoModel = require("../models/photoModel"); // Make sure to adjust the path to your Photo model
const multer = require("multer");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const userModel = require("../models/userModel");
const { S3Client , DeleteObjectCommand} = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const { url } = require("inspector");
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

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
    fileSize: 1024 * 1024 * 5, // 5 MB
  },
  fileFilter: function (req, file, cb) {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});
const upload = multer({ storage: storage });

//updating user profile...
const createPhoto = async (req, res) => {
  try {
    const galleryPictures = req.body
    const user = await userModel.findById(req.user.id);
    console.log("🚀 ~= ~ req.user.id:", req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let uploadPicture = req.file;
    console.log("🚀 ~ createPhoto ~ uploadPicture:", uploadPicture)
    if (req.file) {
      uploadPicture.pictures = req.file?.location;
    }

    const UserPictures = new photoModel({
      userId: req.user.id,
      picture_url: uploadPicture.location,
    });

    await UserPictures.save()

    return res.status(200).json({ code: 200, message: "Picture uploaded" , UserPictures});
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, error: "Error While Uploading Picture" });
  }
};

//Get All capture and edited photos....
const getGalleryPhotos = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    console.log("🚀 ~= ~ req.user.id:", req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const galleryPhotos = await photoModel.find({
      userId: req.user.id,
    }).sort({createdAt: -1});
    if(!galleryPhotos){
      return res.status(404).jsone({message: "Photos not found by this userID"})
    }
    return res.status(200).json({message: "All photos " , galleryPhotos});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const getRecentEditedPhotos = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    console.log("🚀 ~= ~ req.user.id:", req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // const twoDaysAgo = new Date();
    // twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
    // console.log("🚀 ~ getRecentPhotos ~ twoDaysAgo:", twoDaysAgo);
    
    const recentPhotos = await photoModel.find({ 
      userId: req.user.id, 
      // createdAt:{$gte:twoDaysAgo},
    }).sort({createdAt:-1});
    if(!recentPhotos){
      console.log("🚀 ~ getRecentPhotos ~ recentPhotos:", recentPhotos)
      return res.status(404).jsone({message: "Recent Photos not found by this userID"})
    }
    return res.status(200).json({message: " Recent Edited Photos " , recentPhotos});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



//get all edited photos....
const getAllEditedPhotos = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    console.log("🚀 ~= ~ req.user.id:", req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const editedPhotos = await photoModel.find({
      userId: req.user.id,
      isEdited: true,
    }).sort({createdAt: 1});
    if(!editedPhotos){
      return res.status(404).jsone({message: "Photos not found by this userID"})
    }
    return res.status(200).json({message: "All photos " , editedPhotos});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
///




// //delete single photo
// const deletePhoto = async(req, res)=>{
//   try {
//     const photoId = req.params.id
//     const user = await userModel.find({userId: req.user.id})
//     if(!user){
//       return res.status(404).json({message: "User not exist by this id"})
//     }
//     const deletedPhoto = await photoModel.findByIdAndDelete(photoId)
//     if(!deletedPhoto){
//       return res.status(404).json({message: "Photo not exist by this id"})
//     }
//     return res.status(200).json({message: "Photo Deleted", deletedPhoto})

//   } catch (error) {
//     console.log("Error ", error)
//     return res.status(500).json({message: "Internal Server Error"})
//   }
// }

const deletePhoto = async (req, res) => {
  try {
    // const S3_BUCKET = process.env.S3_BUCKET_NAME;
    const photoId = req.params.id;
    console.log("******* ID: ", photoId);

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found by this ID" });
    }

    const photo = await photoModel.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found by this ID" });
    }
    console.log("Photo key: ", photo)
   // Extract the key of the photo stored in S3 from the URL
   const s3Url = new URL(photo.picture_url);
   const s3Key = s3Url.pathname.startsWith('/') ? s3Url.pathname.substring(1) : s3Url.pathname;

   console.log("S3 Key: ", s3Key);
    // Delete the photo from S3
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
    };

    
    // Delete the photo from MongoDB
    const deletedPhoto = await photoModel.findByIdAndDelete(photoId);

    if (!deletedPhoto) {
      return res.status(404).json({ message: "Photo not found by this ID" });
    }

    await s3.send(new DeleteObjectCommand(params));
    return res.status(200).json({ message: "Photo deleted successfully", deletedPhoto });
    

  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




module.exports = { createPhoto, getRecentEditedPhotos, getGalleryPhotos,getAllEditedPhotos,  deletePhoto, upload };
