const API_BASE_URL = "http://localhost:5000/api/admin";

// Handle Login Button Click
document.getElementById('login-btn').addEventListener('click', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Error message container for login
    const loginErrorElement = document.querySelector(".login-form .admin-error-message");

    // Clear any existing errors
    loginErrorElement.textContent = "";

    if (!email || !password) {
        loginErrorElement.textContent = "Email and password are required.";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
           // alert(`Verification code sent to: ${email}`);
            const modal = document.getElementById('verification-modal');
            modal.style.display = 'block'; // Show the modal
        } else {
            loginErrorElement.textContent = data.error || "Login failed. Please try again.";
        }
    } catch (error) {
        console.error("Error during login:", error);
        loginErrorElement.textContent = "An error occurred while logging in.";
    }
});


// Confirm button functionality
document.getElementById('confirm-btn').addEventListener('click', async function () {
    const verificationCode = document.getElementById('verification-code').value.trim();
    const email = document.getElementById('email').value.trim();

    // Error message container for verification
    const verificationErrorElement = document.querySelector("#verification-modal .admin-error-message");

    // Clear any existing errors
    verificationErrorElement.textContent = "";

    if (!email || !verificationCode) {
        verificationErrorElement.textContent = "Email and verification code are required.";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code: verificationCode }),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Verification successful!');
            window.location.href = 'booking.html'; // Redirect to the dashboard or desired page
        } else {
            verificationErrorElement.textContent = result.error || 'Invalid or expired verification code.';
        }
    } catch (error) {
        console.error("Error verifying code:", error);
        verificationErrorElement.textContent = "An error occurred while verifying the code.";
    }
});

/**
 * Utility function to display error messages in the appropriate location
 * @param {string} message - The error message to display
 * @param {string} context - The context of the error ("login" or "verification")
 */
function displayError(message, context) {
    let errorElement;

    if (context === "login") {
        errorElement = document.querySelector(".admin-error-message-login");
    } else if (context === "verification") {
        errorElement = document.querySelector(".admin-error-message");
    }

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.color = "red"; // Make it visually distinct
    }
}
