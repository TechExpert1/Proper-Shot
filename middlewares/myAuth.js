const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const SecretKey = "hellonodejsfamilythisisoursecretkey";

const authorizationMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.sendStatus(401);
    const decoded = jwt.verify(token, SecretKey);
    // console.log(decoded);
    
    const userId = await User.findById(decoded._id);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    req.user = userId;
    // console.log("🚀 ~ authorizationMiddleware ~ req.user:", req.user)
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
};

module.exports = authorizationMiddleware;