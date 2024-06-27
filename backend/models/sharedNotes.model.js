const mongoose = require("mongoose");
const { ObjectID } = require("mongoose/lib/schema/index");
const {v4 : uuidv4} = require('uuid');

const sharedNotesSchema = new mongoose.Schema({
  _id: { 
    type: String,
    required: true,
    },
  userEmail: {
    type: String,
    required: true,
  },
  notesId : {
    type: String,
  }
});

const SharedNotes = mongoose.model("sharedNotes", sharedNotesSchema);
module.exports = SharedNotes;