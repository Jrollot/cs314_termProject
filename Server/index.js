//Load required Modules
require("dotenv").config();           //loads environment variables from a .env file
const express = require("express");   //imports 'express' to build APIs
const mongoose = require("mongoose"); //imports 'mongoose' to interact with mongodb
const cors = require("cors");         //imports CORS to allow frontend (React) to access backend APIs
const http = require("http");
const { Server } = require("socket.io");

//Initialize Express App
const app = express();    //creates an express app
app.use(express.json());  //allows express to handle json requests
app.use(cors({ origin: "http://localhost:5173", credentials: true }));          //allows CORS so that the frontend can send requests to this backend

//temporary testing
app.use((req, res, next) => {
    console.log("Incoming Request:");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Body:", req.body);
    next();
});

// Basic test route
app.get("/", (req, res) => {
    res.send("Backend is running!");
});

//API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/chatrooms", require("./routes/chatrooms"));


//Create HTTP & WebSocket Server
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);

    // Join a Chat Room
    socket.on("joinRoom", ({ roomId }) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Leave a Chat Room
    socket.on("leaveRoom", ({ roomId }) => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);
    });

    // User joins a private chat room for DMs
    socket.on("joinPrivateChat", ({ user1, user2 }) => {
        const privateRoom = [user1, user2].sort().join("_"); // Create a unique private room
        socket.join(privateRoom);
        console.log(`User ${socket.id} joined private chat room: ${privateRoom}`);
    });

    socket.on("sendDirectMessage", async (data) => {
        try {
            const privateRoom = [sender, receiver].sort().join("_"); // Ensure consistent room name
            const newMessage = new Message({ sender, receiver, content });
            await newMessage.save();

            // Broadcast message only to the private room (both sender & receiver get it)
            io.to(privateRoom).emit("receiveMessage", newMessage);
        } catch (error) {
            console.error("Error saving direct message:", error);
        }
    });

    //  Handle Sending Messages in a Room
    socket.on("sendMessage", async ({ sender, roomId, content }) => {
        try {
            const newMessage = new Message({ sender, content, chatRoom: roomId });
            await newMessage.save();

            // Broadcast message to everyone in the room
            io.to(roomId).emit("receiveMessage", newMessage);
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected: " + socket.id);
    });
});

// Connect to MongoDB using URL from .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const PORT = process.env.PORT || 5000;    //uses the port from the .env file
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log("MongoDB Connection Error: ", err));

