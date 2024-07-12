const Edit = require('../models/editModel');

exports.getAllEdits = async (req, res) => {
  try {
    const edits = await Edit.find({}).populate('photoId');
    res.json(edits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createEdit = async (req, res) => {
  try {
    const { photoId } = req.body;
    const edit = new Edit({ photoId });
    await edit.save();
    res.status(201).json(edit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
