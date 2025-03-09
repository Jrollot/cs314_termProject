import axios from "axios";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const receiverId = localStorage.getItem("currentDM");

if (!token || !receiverId) {
  alert("Unauthorized! Redirecting to login...");
  window.location.href = "index.html";
}

// Fetch Receiver Name and Update UI
async function fetchReceiverName() {
    try {
      const response = await axios.get(`${SERVER_URL}/api/auth/user/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const receiver = response.data;
      document.getElementById("dmReceiver").innerText = `Chat with: ${receiver.firstName} ${receiver.lastName}`;
    } catch (error) {
      console.error("Error fetching receiver name:", error.response?.data || error.message);
      document.getElementById("dmReceiver").innerText = "Chat with: Unknown User";
    }
  }

  fetchReceiverName();
  
// Connect to WebSocket
const socket = io(SERVER_URL, { query: { userId } });

socket.on("connect", () => {
  console.log("Connected to DM chat with:", receiverId);
  loadDirectChatHistory();
});

// Load Direct Message History
async function loadDirectChatHistory() {
  try {
    const response = await axios.post(
      `${SERVER_URL}/api/messages/get-direct-messages`,
      { user1: userId, user2: receiverId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const dmChatBox = document.getElementById("dmChatBox");
    dmChatBox.innerHTML = response.data
      .map(
        (msg) => `
      <div style="text-align: ${msg.sender === userId ? "right" : "left"};">
        <strong>${msg.sender === userId ? "Me" : msg.senderName}:</strong> ${msg.content}
      </div>`
      )
      .join("");

    dmChatBox.scrollTop = dmChatBox.scrollHeight;
  } catch (error) {
    console.error("Error loading direct messages:", error);
  }
}

// Send Direct Message
function sendDirectMessage() {
  const messageInput = document.getElementById("dmMessageInput");
  const content = messageInput.value.trim();
  const sender = localStorage.getItem("userId");
  const receiver = localStorage.getItem("currentDM");

  if (!content) return;

  if (!sender || !receiver) {
    alert("Sender or receiver is missing. Please try again.");
    window.location.href = "chatrooms.html"; // Redirect back if user data is missing
    return;
  }

  socket.emit("sendDirectMessage", { sender: userId, receiver: receiverId, content });

  axios.post(
    `${SERVER_URL}/api/messages/send-direct`,
    { sender, receiver, content },
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  ).catch(error => {
    console.error("Error sending DM:", error);
    alert("Error sending message.");
  });

  messageInput.value = "";
}

// Receive Direct Messages in Real-Time
socket.on("receiveDirectMessage", (msg) => {
  const dmChatBox = document.getElementById("dmChatBox");
  dmChatBox.innerHTML += `
    <div style="text-align: ${msg.sender === userId ? "right" : "left"};">
      <strong>${msg.sender === userId ? "Me" : msg.senderName || "Unknown User"}:</strong> ${msg.content}
    </div>`;
  dmChatBox.scrollTop = dmChatBox.scrollHeight;
});

// Attach functions globally
window.sendDirectMessage = sendDirectMessage;
