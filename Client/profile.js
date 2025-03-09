import axios from "axios";

const SERVER_URL = "http://localhost:5000"; // Ensure this matches your backend
const token = localStorage.getItem("token");

if (!token) {
  alert("Unauthorized! Redirecting to login...");
  window.location.href = "index.html";
}

// Update User Profile
async function updateProfile() {
  const firstName = document.getElementById("newFirstName").value.trim();
  const lastName = document.getElementById("newLastName").value.trim();

  if (!firstName || !lastName) {
    alert("Please enter both first and last name.");
    return;
  }

  try {
    const response = await axios.post(
      `${SERVER_URL}/api/auth/update-profile`,
      { firstName, lastName },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    alert("Profile updated successfully!");
  } catch (error) {
    console.error("Error updating profile:", error.response?.data || error.message);
    alert("Error updating profile.");
  }
}

// Redirect to chatrooms
function goBack() {
  window.location.href = "chatrooms.html";
}

// Attach functions globally
window.updateProfile = updateProfile;
window.goBack = goBack;
