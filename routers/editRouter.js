const express = require('express');
const editRouter = express.Router();
const editController = require('../controllers/editController');

editRouter.get('/all', editController.getAllEdits);
editRouter.post('/create', editController.createEdit);

module.exports = editRouter;
