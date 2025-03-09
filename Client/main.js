import axios from "axios";

// Backend URL
//const SERVER_URL = "https://quality-visually-stinkbug.ngrok-free.app";
const SERVER_URL = "http://localhost:5000"; // Use your local backend

async function callSignup() {
  // 1) Get input elements
  const firstNameInput = document.getElementById("signupFirstName");
  const lastNameInput = document.getElementById("signupLastName");
  const emailInput = document.getElementById("signupEmail");
  const passwordInput = document.getElementById("signupPassword");

  // 2) Check if elements exist
  if (!firstNameInput.value.trim() || !lastNameInput.value.trim() || !emailInput || !passwordInput) {
    //console.error("Missing #email or #password element in HTML");
    alert("Please fill in all fields.");
    return;
  }

  // 3) Extract values
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // 4) Validate inputs
  if (!firstName || !lastName || !email || !password) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    // 5) Show loading message
    alert("Signing up... Please wait.");

    // 6) Send request using Axios
    const response = await axios.post(
      //`${SERVER_URL}/api/auth/signup`,
      `${SERVER_URL}/api/auth/signup`,
      { firstName, lastName, email, password },
      { headers: { "Content-Type": "application/json" } }
    );

    // 7) Success response
    console.log("Signup successful:", response.data);
    alert("Signup successful!\n" + JSON.stringify(response.data, null, 2));

    //redirect to login page after sign up
    window.location.href = "index.html";
  } catch (error) {
    // 8) Handle errors
    console.error("Signup error:", error);
    const message =
      error.response?.data?.message || error.message || "Unknown error";
    alert(`Signup error: ${message}`);
  }
}

// Login Function
async function callLogin() {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  if (!emailInput || !passwordInput) {
    console.error("Missing #loginEmail or #loginPassword element in HTML");
    alert("Error: Email or password field is missing.");
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    alert("Logging in... Please wait.");
    const response = await axios.post(`${SERVER_URL}/api/auth/login`, { email, password }, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("Login successful:", response.data);
    
    // Store token and user ID
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("userId", response.data.user._id);

    // Redirect to chatroom list after login
    window.location.href = "chatrooms.html";
  } catch (error) {
    console.error("Login error:", error);
    const message = error.response?.data?.message || error.message || "Unknown error";
    alert(`Login error: ${message}`);
  }
}
// Attach function globally (for debugging in console)
window.callSignup = callSignup;
window.callLogin = callLogin;
