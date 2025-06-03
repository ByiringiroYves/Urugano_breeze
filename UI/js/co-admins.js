
const isProduction = window.location.hostname === 'gogovillas.com' || window.location.hostname === 'www.gogovillas.com';

// Set the base URL accordingly
const API_BASE_URL = isProduction
    ? "https://backend-service-432219336422.us-central1.run.app/api/admin" // Production Backend
    : "http://localhost:8080/api/admin";  

//const API_BASE_URL = "https://backend-service-432219336422.us-central1.run.app/api/admin";

// Handle form submission for creating an admin account
document.getElementById('createAdminForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Fetch values from form inputs
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    // Error message container
    const errorMessage = document.querySelector('.admin-error-message-1');

    // Clear previous error messages
    errorMessage.textContent = "";

    // Validate required fields
    if (!fullname || !email || !password || !confirmPassword) {
        errorMessage.textContent = "All fields are required.";
        return;
    }

    // Validate password match
    if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match.";
        return;
    }

    try {
        // Send request to backend API
        const response = await fetch(`${API_BASE_URL}/create-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Fullname: fullname, email, password, confirmpassword: confirmPassword }),
        });

        const data = await response.json();

        // Handle success or error response
        if (response.ok) {
            alert("Admin created successfully!");
            window.location.href = 'booking.html'; // Redirect to desired page
        } else {
            errorMessage.textContent = data.error || "Failed to create admin.";
        }
    } catch (error) {
        console.error("Error creating admin:", error);
        errorMessage.textContent = "An error occurred while creating the admin.";
    }
});
