const mongoose = require("mongoose");
const User = require("./User");
const storySchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "public",
    enum: ["public", "private"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Story = mongoose.model("Story", storySchema);
module.exports = Story;
