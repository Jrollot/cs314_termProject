const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Room name (must be unique)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who created the room
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // Users in the room
}, { timestamps: true });

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);