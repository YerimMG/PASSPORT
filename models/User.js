const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    username: String,
    password: String,
    name: String,
    email: String,
    googleId: String,
    githubId: String,
    role: {
      type: String,
      enum: ["GUEST", "EDITOR", "ADMIN"],
      default: "GUEST"
    },
  }, {
    timestamps: {
      createdAt: "created_at",
      updateAt: "update_at"
    }
  }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
