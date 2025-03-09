const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const router = express.Router();

// Create a new message (POST /messages)
router.post("/send", async (req, res) => {
    try {
        const { sender, roomId, content } = req.body;

        // Validate request
        if (!sender || !roomId || !content) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Fetch sender details
        const senderUser = await User.findById(sender).select("firstName lastName email");
        if (!senderUser) {
            return res.status(404).json({ message: "Sender not found" });
        }

        // Save the message in MongoDB
        const newMessage = new Message({ 
            sender, 
            roomId, 
            content,
            senderName: `${senderUser.firstName} ${senderUser.lastName}`});
        await newMessage.save();

        res.status(201).json({message: "Message sent", newMessage});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send a Direct Message (DM)
router.post("/send-direct", async (req, res) => {
    try {
        const { sender, receiver, content } = req.body;

        if (!sender || !receiver || !content) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Ensure sender and receiver exist
        const senderUser = await User.findById(sender).select("firstName lastName email");
        const receiverUser = await User.findById(receiver).select("firstName lastName email");

        if (!senderUser || !receiverUser) {
            return res.status(404).json({ message: "Sender or receiver not found" });
        }

        // Save the direct message in MongoDB
        const newMessage = new Message({
            sender,
            receiver,
            content,
            senderName: `${senderUser.firstName} ${senderUser.lastName}`,
            receiverName: `${receiverUser.firstName} ${receiverUser.lastName}`
        });

        await newMessage.save();
        res.status(201).json({ message: "Direct message sent", newMessage });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get messages for a chat room
router.post("/get-messages", async (req, res) => {
    try {
        const { roomId } = req.body;
        //const messages = await Message.find({ chatRoom: req.params.chatRoom }).sort({ createdAt: 1 });
        
        if (!roomId) {
            return res.status(400).json({ message: "Missing chatroom ID" });
        }
        
        const messages = await Message.find({roomId })
        .populate("sender", "firstName lastName email") //  Get the sender's email instead of just ID
        .sort({ createdAt: 1 });
        
        res.json(messages.map(msg => ({
            //_id: msg._id,
            sender: msg.sender._id,
            senderName: `${msg.sender.firstName} ${msg.sender.lastName}`, // Include sender's name
            content: msg.content,
            //createdAt: msg.createdAt
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Get Direct Messages Between Two Users
router.post("/get-direct-messages", async (req, res) => {
    try {
        const { user1, user2 } = req.body;

        if (!user1 || !user2) {
            return res.status(400).json({ message: "Both user IDs are required" });
        }

        // Fetch messages between two users
        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        })
        .populate("sender", "firstName lastName email")  // Fetch sender name
        .populate("receiver", "firstName lastName email") //Fetch receiver name
        .sort({ createdAt: 1 });

        res.json(messages.map(msg => ({
            _id: msg._id,
            sender: msg.sender._id,
            senderName: `${msg.sender.firstName} ${msg.sender.lastName}`,
            receiver: msg.receiver._id,
            receiverName: `${msg.receiver.firstName} ${msg.receiver.lastName}`,
            content: msg.content,
            createdAt: msg.createdAt
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
