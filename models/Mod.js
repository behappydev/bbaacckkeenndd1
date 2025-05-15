const mongoose = require('mongoose');

const modSchema = new mongoose.Schema({
  _id:         { type: String }, 
  name:        { type: String, required: true },
  description: { type: String, required: true }
});

module.exports = mongoose.model('Mod', modSchema);
