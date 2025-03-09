const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// User Registration
router.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ message: "That email is already in use." });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ firstName, lastName, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Error in /register:", err);
        res.status(500).json({ error: err.message });
    }
});

// User Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No user found with the given email." });

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Create a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token, user });
        //res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//user logout (frontend should clear token)
router.post("/logout", (req, res) => {
    try{
        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
});

// Get User Info
router.get("/userinfo", async (req, res) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) return res.status(401).json({ message: "Unauthorized: No token provided" });

        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized: Token Missing" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (err) {
        res.status(401).json({ message: "Unauthorized" });
    }
});

// Update Profile 
router.post("/update-profile", async (req, res) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.id) {
            return res.status(400).json({ message: "Bad Request: User ID missing in token" });
        }

        const { firstName, lastName } = req.body;
        if (!firstName || !lastName) {
            return res.status(400).json({ message: "First and last name are required" });
        }

        const user = await User.findById(decoded.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { firstName, lastName },
            { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Search Users by Name or Email
router.post("/search-users", async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Find users matching first name, last name, or email
        const users = await User.find({
            $or: [
                { firstName: { $regex: query, $options: "i" } },
                { lastName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } }
            ]
        }).select("_id firstName lastName email");

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get User Details by ID
router.get("/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("firstName lastName email");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ firstName: user.firstName, lastName: user.lastName, email: user.email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
