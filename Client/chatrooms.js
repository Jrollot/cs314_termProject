import axios from "axios";

const SERVER_URL = "http://localhost:5000"; // Ensure this matches your backend
const token = localStorage.getItem("token");

// Fetch and Display Chatrooms
async function fetchChatrooms() {
  try {
    const chatroomList = document.getElementById("chatroomList");

    if (!chatroomList) {
      console.error(" Error: chatroomList element not found in the DOM.");
      return;
    }

    //const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token) {
      alert("Unauthorized! Redirecting to login...");
      window.location.href = "index.html";
      return;
    }

    const response = await axios.get(`${SERVER_URL}/api/chatrooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Display chatrooms
    // const chatroomList = document.getElementById("chatroomList");
    if (!response.data || response.data.length === 0) {
      chatroomList.innerHTML = "<p>No chatrooms available. Create one!</p>";
    } else {
      chatroomList.innerHTML = response.data
        .map((room) => {
            const isCreator = room.createdBy._id === userId;

          return`
        <div class="chatroom">
          <strong>${room.name}</strong>
          <button onclick="joinRoom('${room._id}')">Join</button>
          ${isCreator ? `<button onclick="deleteChatroom('${room._id}')">Delete</button>` : ""} <!-- Delete button appears only for the creator -->
        </div>
      `;
    })
        .join("");
    }
  } catch (error) {
    console.error("Error fetching chatrooms:", error);
    alert("Error fetching chatrooms.");
  }
}

// Create a New Chatroom
async function createChatroom() {
  const chatroomName = document.getElementById("newChatroom").value.trim();
  if (!chatroomName) {
    alert("Please enter a chatroom name.");
    return;
  }

  try {
    //const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to create a chatroom.");
        return;
      }

    const response = await axios.post(
      `${SERVER_URL}/api/chatrooms/create`,
      { name: chatroomName },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    alert("Chatroom created successfully!");
    fetchChatrooms(); // Refresh chatroom list
  } catch (error) {
    //console.error("Error creating chatroom:", error);
    //alert("Error creating chatroom.");

    console.error(" Error creating chatroom:", error.response?.data || error.message);

    let errorMessage = error.response?.data?.message || "Unknown error";

    if (error.response?.status === 409) {
      errorMessage = " Chatroom name already exists. Please choose a different name.";
    } else if (error.response?.status === 401) {
      errorMessage = " Unauthorized: Please log in again.";
      localStorage.removeItem("token");
      window.location.href = "index.html"; // Redirect to login page
    }

    alert(errorMessage);
  }
}

//Delete a Chatroom
async function deleteChatroom(roomId) {
    if (!confirm("Are you sure you want to delete this chatroom?")) return;
  
    try {
      //const token = localStorage.getItem("token");
      await axios.delete(`${SERVER_URL}/api/chatrooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      alert("Chatroom deleted successfully!");

      // Ensure chatroom list exists before updating UI
    const chatroomList = document.getElementById("chatroomList");
    if (!chatroomList) {
      console.error("Error: chatroomList element not found in the DOM after deletion.");
      return;
    }

      fetchChatrooms(); // Refresh chatroom list
    } catch (error) {
      console.error("Error deleting chatroom:", error);
      alert("Error deleting chatroom.");
    }
  }

// Join a Chatroom (Redirect)
async function joinRoom(roomId) {
    //const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
        alert("Unauthorized! Redirecting to login...");
        window.location.href = "index.html";
        return;
      }

    try {
        await axios.post(
          `${SERVER_URL}/api/chatrooms/join`,
          { userId, roomId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        localStorage.setItem("currentRoom", roomId);
        window.location.href = "chat.html";
    } catch(error){
        console.error("Error joining chatroom:", error.response?.data || error.message);
        alert("Error joining chatroom.");
    }
}

//search users by name or email
async function searchUsers() {
    const query = document.getElementById("searchUserInput").value.trim();
    if (!query) {
      alert("Please enter a name or email to search.");
      return;
    }
  
    try {
      const response = await axios.post(
        `${SERVER_URL}/api/auth/search-users`,
        { query },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
  
      const users = response.data;
      const resultsDiv = document.getElementById("userSearchResults");
      
      if (users.length === 0) {
        resultsDiv.innerHTML = "<p>No users found.</p>";
        return;
      }
  
      resultsDiv.innerHTML = users
        .map(user => `
          <div>
            <strong>${user.firstName} ${user.lastName}</strong> (${user.email})
            <button onclick="startDirectMessage('${user._id}')">Chat</button>
          </div>
        `)
        .join("");
    } catch (error) {
      console.error("Error searching users:", error.response?.data || error.message);
      alert("Error searching users.");
    }
  }

// Start a Direct Message
function startDirectMessage(userId) {
  
    if (!userId) {
      alert("Invalid user selected.");
      return;
    }
  
    localStorage.setItem("currentDM", userId);
    window.location.href = "dm.html"; // Redirect to direct chat UI
  }

// Logout function
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  window.location.href = "index.html";
}

// Load chatrooms when the page loads
fetchChatrooms();

// Attach functions globally
window.createChatroom = createChatroom;
window.deleteChatroom = deleteChatroom;
window.startDirectMessage = startDirectMessage;
window.joinRoom = joinRoom;
window.searchUsers = searchUsers;
window.startDirectMessage = startDirectMessage;
window.logout = logout;
 
