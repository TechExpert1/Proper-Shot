const photoModel = require("../models/photoModel"); 
const multer = require("multer");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
const userModel = require("../models/userModel");

const createPhoto = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let uploadPicture = req.file;
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
}


const getRecentPhotos = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    console.log("🚀 ~= ~ req.user.id:", req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const recentPhotos = await photoModel.find({ 
      userId: req.user.id, 
    }).sort({createdAt:-1});
    if(!recentPhotos){
      console.log("🚀 ~ getRecentPhotos ~ recentPhotos:", recentPhotos)
      return res.status(404).jsone({message: "Recent Photos not found by this userID"})
    }
    return res.status(200).json({message: " Recent Photos " , recentPhotos});
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


module.exports = { createPhoto, getRecentPhotos, getGalleryPhotos,getAllEditedPhotos,  deletePhoto,  };

