const API_BASE_URL = "http://localhost:5000/api/admin";

// Handle Login Button Click
document.getElementById('login-btn').addEventListener('click', async function (event) {
    event.preventDefault();

    // Get values from the login form
    const email = document.getElementById('email').value.trim(); // Corrected ID to 'email'
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert("Please fill in both fields.");
        return;
    }

    try {
        // Call the login API to authenticate and send the verification code
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Verification code sent to: ${email}`);
            // Show the modal
            const modal = document.getElementById('verification-modal');
            modal.style.display = 'block'; // Set display to 'block' to make the modal visible
        } else {
            alert(data.error || "Login failed. Please try again.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred while logging in.");
    }
});

// Confirm button functionality
document.getElementById('confirm-btn').addEventListener('click', async function () {
    // Get values from the modal form
    const verificationCode = document.getElementById('verification-code').value.trim();
    const email = document.getElementById('email').value.trim(); // Ensure we retrieve the email

    if (!email || !verificationCode) {
        alert('Email and verification code are required.');
        return;
    }

    try {
        // Call the verify-code API
        const response = await fetch(`${API_BASE_URL}/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code: verificationCode }),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Verification successful!');
            // Redirect to another page (e.g., booking.html or dashboard)
            window.location.href = 'booking.html';
        } else {
            alert(result.error || 'Invalid or expired verification code.');
        }
    } catch (error) {
        console.error('Error verifying code:', error);
        alert('An error occurred while verifying the code.');
    }
});
