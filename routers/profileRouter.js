const express = require('express');
const { updateProfile , upload} = require('../controllers/profileContorller');
const authorizationMiddleware = require('../middlewares/myAuth');
const profileRouter = express.Router()


// router.post('/upload/:userId', upload, uploadPicture);
profileRouter.put('/update_profile', authorizationMiddleware , upload.single('picture'),updateProfile)

module.exports = profileRouter