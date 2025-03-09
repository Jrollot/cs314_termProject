const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Search Contacts
router.post("/search", async (req, res) => {
    try {
        const { query } = req.body;
        const users = await User.find({ email: { $regex: query, $options: "i" } }).select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Contacts Except Self
router.get("/all-contacts", async (req, res) => {
    try {
        const token = req.header("Authorization").split(" ")[1];
        const decoded = jwt.verify(token, "your_jwt_secret");

        const contacts = await User.find({ _id: { $ne: decoded.id } }).select("-password");
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Contacts Sorted by Last Message Time
router.get("/get-contacts-for-list", async (req, res) => {
    try {
        // Implement logic to sort by last message time
        res.json({ message: "Sort contacts by last message time - Not implemented yet" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Direct Messages
router.delete("/delete-dm/:dmId", async (req, res) => {
    try {
        // Implement logic to delete messages by `dmId`
        res.json({ message: "Direct message deleted - Not implemented yet" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
