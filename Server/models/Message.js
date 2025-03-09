const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    content: { type: String, required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: false }, 
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);
