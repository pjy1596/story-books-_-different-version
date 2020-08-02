const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
});
const User = mongoose.model("User", userSchema);
module.exports = User;
