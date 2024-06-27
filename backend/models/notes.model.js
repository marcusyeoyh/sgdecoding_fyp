const mongoose = require("mongoose");
const { ObjectID } = require("mongoose/lib/schema/index");
const {v4 : uuidv4} = require('uuid');

const NoteSchema = new mongoose.Schema({
  _id: { 
    type: String,
    required: true,
    },
  userEmail: {
    type: String,
    required: true,
  },title : {
    type: String,
  },
  text: {
    type: String,
  }
});

const Notes = mongoose.model("Notes", NoteSchema);
module.exports = Notes;