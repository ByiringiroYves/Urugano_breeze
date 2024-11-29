
const API_BASE_URL = "http://localhost:5000/api/admin";

// Handle form submission for creating an admin account
document.getElementById("createAdminForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    // Get values from the form inputs
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const errorMessageElement = document.querySelector(".admin-error-message-1");

    errorMessageElement.textContent = ""; // Clear previous errors

    // Validate required fields
    if (!email || !password || !confirmPassword) {
        errorMessageElement.textContent = "All fields are required.";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/create-admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, confirmpassword: confirmPassword }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Admin account created successfully!");
            document.getElementById("createAdminForm").reset();
        } else {
            errorMessageElement.textContent = data.error || "Failed to create admin account.";
        }
    } catch (error) {
        console.error("Error creating admin:", error);
        errorMessageElement.textContent = "An error occurred while creating the admin account.";
    }
});