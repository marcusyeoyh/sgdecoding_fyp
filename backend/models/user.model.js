const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  last_login: {
    type: Date,
    required: true,
  },
  created_at: {
    type: Date,
    required: true
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;