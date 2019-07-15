const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User  = require("./User")


const RoomSchema = Schema({
  name:  String,
  desc:  String,
  owner: User
});


const Rooms = mongoose.model("Rooms", RoomSchema);
module.exports = Rooms;
