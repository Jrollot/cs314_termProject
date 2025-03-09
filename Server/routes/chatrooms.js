const express = require("express");
const jwt = require("jsonwebtoken");
const ChatRoom = require("../models/ChatRoom");
const User = require("../models/User");

const router = express.Router();

// Create a Chat Room (POST /api/chatrooms/create)
router.post("/create", async (req, res) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) return res.status(401).json({ message: "Unauthorized: No token provided" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { name } = req.body;

        if (!name) return res.status(400).json({ message: "Chat room name is required" });

        // Check if the chat room already exists
        const existingRoom = await ChatRoom.findOne({ name });
        if (existingRoom) return res.status(409).json({ message: "Chat room already exists" });

        const newRoom = new ChatRoom({ name, createdBy: decoded.id, members: [decoded.id] });
        await newRoom.save();

        res.status(201).json({ message: "Chat room created successfully", room: newRoom });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a Chat Room (DELETE /api/chatrooms/:roomId)
router.delete("/:roomId", async (req, res) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) return res.status(401).json({ message: "Unauthorized: No token provided" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { roomId } = req.params;

        const room = await ChatRoom.findById(roomId);
        if (!room) return res.status(404).json({ message: "Chat room not found" });

        // Only the creator can delete the room
        if (room.createdBy.toString() !== decoded.id) {
            return res.status(403).json({ message: "Forbidden: Only the creator can delete this room" });
        }

        await ChatRoom.findByIdAndDelete(roomId);
        res.json({ message: "Chat room deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Chat Rooms (GET /api/chatrooms)
router.get("/", async (req, res) => {
    try {
        const rooms = await ChatRoom.find().populate("createdBy", "email");
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add user to chatroom members
router.post("/join", async (req, res) => {
    try {
        const { userId, roomId } = req.body;

        if (!userId || !roomId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const chatroom = await ChatRoom.findById(roomId);
        if (!chatroom) {
            return res.status(404).json({ message: "Chatroom not found" });
        }

        // Add user to chatroom members if they aren't already in it
        if (!chatroom.members.includes(userId)) {
            chatroom.members.push(userId);
            await chatroom.save();
        }

        res.json({ message: "User added to chatroom", chatroom });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
