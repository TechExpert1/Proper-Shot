const photoModel = require("../models/photoModel"); 
const multer = require("multer");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
const userModel = require("../models/userModel");

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
    const { page = 1, limit = 10 } = req.query;
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User  not found" });
    }
    const options = {
      sort: { createdAt: -1 },
      populate: [],
      lean: true,
      offset: (page - 1) * limit,
      limit: limit
    };
    const galleryPhotos = await photoModel.paginate({ userId: req.user.id }, options);
    if (!galleryPhotos.docs) {
      return res.status(404).json({ message: "Photos not found by this userID" });
    }
    return res.status(200).json({
      message: "All photos",
      galleryPhotos: galleryPhotos.docs,
      totalPages: galleryPhotos.totalPages,
      currentPage: page,
      totalDocs: galleryPhotos.totalDocs 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
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
    const recentPhotos = await photoModel.paginate({ userId: req.user.id }, options);
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
      return res.status(404).json({ error: "User  not found" });
    }
    const options = {
      sort: { createdAt: 1 },
      lean: true,
      offset: (page - 1) * limit,
      limit: limit
    };
    const editedPhotos = await photoModel.paginate({ userId: req.user.id, isEdited: true }, options);
    if (!editedPhotos.docs) {
      return res.status(404).json({ message: "Photos not found by this userID" });
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
// update photo
const updatephoto = async (req, res) => {
  try {
    const photoId = req.params.id;
    const { isEdited, name } = req.body;
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User  not found by this ID" });
    }
    const photo = await photoModel.findByIdAndUpdate(photoId, { isEdited, name }, { new: true });
    if (!photo) {
      return res.status(404).json({ message: "Photo not found by this ID" });
    }
    return res.status(200).json({ message: "Photo updated successfully", photo });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = { createPhoto, getRecentPhotos, getGalleryPhotos,getAllEditedPhotos,  deletePhoto,updatephoto  };

