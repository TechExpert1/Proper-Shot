const photoModel = require("../models/photoModel"); 
const multer = require("multer");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
const userModel = require("../models/userModel");
const Notification=require("../models/Notification")
const {sendPushNotification}=require("../utils/pushNotification")
const createPhoto = async (req, res) => {
  try {
    const {isEdited,name} = req.body;
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let uploadPicture = req.file;
    if (req.file) {
      uploadPicture.pictures = req.file?.location;
    }
    const UserPictures = new photoModel({
      name,
      userId: req.user.id,
      isEdited,
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
    // Parse page and limit as integers, with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Fetch the user to verify existence
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Set up pagination options
    const options = {
      sort: { createdAt: -1 },
      lean: true,
      page,
      limit,
    };

    // Fetch paginated gallery photos
    const galleryPhotos = await photoModel.paginate(
      { userId: req.user.id, isEdited: false },
      options
    );

    // Check if any photos exist for the user
    if (!galleryPhotos.docs || galleryPhotos.docs.length === 0) {
      return res.status(200).json({
        message: "No photos found by this userID",
        galleryPhotos: [],
        totalPages: galleryPhotos.totalPages || 0,
        currentPage: galleryPhotos.page,
        totalDocs: galleryPhotos.totalDocs || 0,
      });
    }

    // Return the paginated photos
    return res.status(200).json({
      message: "All photos",
      galleryPhotos: galleryPhotos.docs,
      totalPages: galleryPhotos.totalPages,
      currentPage: galleryPhotos.page,
      totalDocs: galleryPhotos.totalDocs,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


const getRecentPhotos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = await userModel.findById(req.user.id);
    console.log("🚀 ~= ~ req.user.id:", req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User  not found" });
    }
    const options = {
      sort: { createdAt: -1 },
      lean: true,
      offset: (page - 1) * limit,
      limit: limit
    };
    const recentPhotos = await photoModel.paginate({ userId: req.user.id,isEdited: false }, options);
    if (!recentPhotos.docs) {
      console.log("🚀 ~ getRecentPhotos ~ recentPhotos:", recentPhotos)
      return res.status(404).json({ message: "Recent Photos not found by this userID" });
    }
    return res.status(200).json({
      message: "Recent Photos",
      recentPhotos: recentPhotos.docs,
      totalPages: recentPhotos.totalPages,
      currentPage: page,
      totalDocs: recentPhotos.totalDocs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//get all edited photos....
const getAllEditedPhotos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const options = {
      sort: { updatedAt: -1 },
      lean: true,
      offset: (page - 1) * limit,
      limit: limit
    };

    const editedPhotos = await photoModel.paginate(
      { userId: req.user.id, isEdited: true },
      options
    );

    // If no edited photos are found, return an empty array with pagination info
    if (!editedPhotos.docs || editedPhotos.docs.length === 0) {
      return res.status(200).json({
        message: "No edited photos found by this userID",
        editedPhotos: [],
        totalPages: editedPhotos.totalPages || 0,
        currentPage: page,
        totalDocs: editedPhotos.totalDocs || 0
      });
    }

    return res.status(200).json({
      message: "All edited photos",
      editedPhotos: editedPhotos.docs,
      totalPages: editedPhotos.totalPages,
      currentPage: page,
      totalDocs: editedPhotos.totalDocs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const photoId = req.params.id;
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found by this ID" });
    }
    const photo = await photoModel.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found by this ID" });
    }
  //  const s3Url = new URL(photo.picture_url);
  //  const s3Key = s3Url.pathname.startsWith('/') ? s3Url.pathname.substring(1) : s3Url.pathname;
  //   const params = {
  //     Bucket: process.env.S3_BUCKET_NAME,
  //     Key: s3Key,
  //   };
    const deletedPhoto = await photoModel.findByIdAndDelete(photoId);
    if (!deletedPhoto) {
      return res.status(404).json({ message: "Photo not found by this ID" });
    }
    // await s3.send(new DeleteObjectCommand(params));
    return res.status(200).json({ message: "Photo deleted successfully"});
  
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
// controller for delete multiple image
const deletebulkimage=async(req,res)=>{
  try {
    const photoIds = req.body.photoIds;
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found by this ID" });
    }
    const deletedPhotos = await photoModel.deleteMany({ userId: req.user.id, _id: { $in: photoIds } });
    if (deletedPhotos.deletedCount === 0) {
      return res.status(404).json({ message: "No photos found by this ID" });
    }
    return res.status(200).json({ message: "Photos deleted successfully" });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
// update photo
const updatephoto = async (req, res) => {
  try {
    const { isEdited, name } = req.body;
    const photoId = req.params.id;
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let photo = await photoModel.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    if (photo.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (name) {
      photo.name = name;
    }

    if (typeof isEdited !== "undefined") {
      photo.isEdited = isEdited;
    }

    // Handle new file upload if provided
    if (req.file) {
      photo.picture_url = req.file.location;
    }

    await photo.save();

    // Prepare notification message and title
    const notificationMessage = "Your photo has been successfully updated.";
    const notificationTitle = "Photo Updated";
    const notificationParams = { photoId: photo._id }; // Include photoId in params if needed

    // In-App Notification
    const newNotification = new Notification({
      recipient: user._id,  // The user is the recipient
      heading: notificationTitle,
      message: notificationMessage,
      sender: null,  // No specific sender in this case
      params: notificationParams  // You can add photo details in params if necessary
    });

    // Save in-app notification to database
    await newNotification.save();

    // Push Notification
    if (user.deviceToken) {
      sendPushNotification(
        user.deviceToken,
        notificationTitle,
        notificationMessage,
        "PHOTO_UPDATE_NOTIFICATION",
        notificationParams
      );
    }

    return res.status(200).json({ code: 200, message: "Photo updated", photo });
  } catch (error) {
    console.error("Error While Updating Photo:", error);
    res.status(500).json({ code: 500, error: "Error While Updating Photo" });
  }
};



module.exports = { createPhoto, getRecentPhotos, getGalleryPhotos,getAllEditedPhotos,  deletePhoto,updatephoto,deletebulkimage  };

