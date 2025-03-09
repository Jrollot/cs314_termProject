import axios from "axios";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:5000"; // Ensure this matches your backend
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const roomId = localStorage.getItem("currentRoom"); //  Get current chatroom ID
const chatBox = document.getElementById("chatBox");
const chatroomName = document.getElementById("chatroomName");

//  Redirect to login if no token
if (!token || !roomId) {
  alert("Unauthorized! Redirecting to login...");
  window.location.href = "index.html";
}

// Connect to WebSocket
const socket = io(SERVER_URL, { query: { roomId } });

socket.on("connect", () => {
  console.log(" Connected to chatroom:", roomId);
  loadChatHistory(); // Load previous messages
});

// Load Chat History
async function loadChatHistory() {
  try {
    chatBox.innerHTML = "<p>Loading messages... </p>";

    const response = await axios.post(
      `${SERVER_URL}/api/messages/get-messages`,
      { roomId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    chatBox.innerHTML = response.data
      .map(
        (msg) => `
      <div class="message ${msg.sender === userId ? "roomId" : "sender"}">
        <strong>${msg.senderName || "Unknown User"}:</strong> ${msg.content}
      </div>`
      )
      .join("");

    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to latest message
  } catch (error) {
    console.error(" Error loading messages:", error);
  }
}

// Send Message
function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const content = messageInput.value.trim();
  const userId = localStorage.getItem("userId");

  if (!content) 
  {
    alert("Message cannot be empty.");
    return;
  }

  if (!userId) {
    alert("User ID is missing. Please log in again.");
    window.location.href = "index.html";
    return;
  }

  console.log(`Sending message: ${content} to room: ${roomId}`);

  socket.emit("sendMessage", { sender: userId, roomId, content });

  axios.post(
    `${SERVER_URL}/api/messages/send`,
    { sender: userId, roomId, content },
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  ).catch(error => {
    console.error("Error sending message:", error.response?.data || error.message);
    alert("Error sending message.");
  });

  messageInput.value = "";
}

// Receive Messages in Real-Time
socket.on("receiveMessage", (msg) => {
  chatBox.innerHTML += `
    <div class="message ${msg.sender === userId ? "roomId" : "sender"}">
      <strong>${msg.senderName || "Unknown User"}:</strong> ${msg.content}
    </div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Leave Chatroom
function leaveChatroom() {
  localStorage.removeItem("currentRoom");
  window.location.href = "chatrooms.html";
}

// Attach functions globally
window.sendMessage = sendMessage;
window.leaveChatroom = leaveChatroom;
