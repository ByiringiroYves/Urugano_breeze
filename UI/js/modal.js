const API_BASE_URL = "http://localhost:5000/api/admin";

/**
 * Store JWT token in localStorage
 * @param {string} token - The JWT token
 */
function setToken(token) {
    localStorage.setItem("authToken", token);
}

/**
 * Retrieve JWT token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
function getToken() {
    return localStorage.getItem("authToken");
}

/**
 * Clear JWT token from localStorage
 */
function clearToken() {
    localStorage.removeItem("authToken");
}

/**
 * Handle Login Button Click
 */
document.getElementById("login-btn").addEventListener("click", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginErrorElement = document.querySelector(".login-form .admin-error-message");

    // Clear existing errors
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
            console.log("Login response:", data);

            if (data.token) {
                setToken(data.token); // Store the JWT token
                if (data.verificationCodeSent) {
                    sessionStorage.setItem("verificationEmail", email);
                    document.getElementById("verification-modal").style.display = "block";
                } else {
                    window.location.href = "admin-dashboard.html"; // Redirect to dashboard
                }
            }
        } else {
            loginErrorElement.textContent = data.error || "Login failed. Please try again.";
        }
    } catch (error) {
        console.error("Error during login:", error);
        loginErrorElement.textContent = "An error occurred while logging in.";
    }
});

/**
 * Confirm Button Functionality for 2FA
 */
document.getElementById("confirm-btn").addEventListener("click", async function () {
    const verificationCode = document.getElementById("verification-code").value.trim();
    const email = sessionStorage.getItem("verificationEmail");

    const verificationErrorElement = document.querySelector("#verification-modal .admin-error-message");
    verificationErrorElement.textContent = "";

    if (!email || !verificationCode) {
        verificationErrorElement.textContent = "Email and verification code are required.";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/verify-code`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`, // Pass the JWT token
            },
            body: JSON.stringify({ email, code: verificationCode }),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Verification successful!");
            sessionStorage.removeItem("verificationEmail");
            window.location.href = "admin-dashboard.html";
        } else {
            verificationErrorElement.textContent = result.error || "Invalid or expired verification code.";
        }
    } catch (error) {
        console.error("Error verifying code:", error);
        verificationErrorElement.textContent = "An error occurred while verifying the code.";
    }
});

/**
 * Validate session on page load
 */
async function validateSession() {
    const token = getToken();

    if (!token) {
        alert("Your session has expired. Please log in again.");
        window.location.href = "admin.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`, // Pass the JWT token
            },
        });

        if (!response.ok) {
            throw new Error("Session validation failed.");
        }

        const data = await response.json();
        console.log("Session validated for:", data.fullName);
    } catch (error) {
        console.error("Error validating session:", error);
        alert("Your session has expired. Please log in again.");
        clearToken();
        window.location.href = "admin.html";
    }
}

/**
 * Logout function
 */
async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`, // Pass the JWT token
            },
        });

        if (response.ok) {
            alert("Logged out successfully!");
            clearToken(); // Clear the JWT token
            window.location.href = "admin.html";
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "Logout failed.");
        }
    } catch (error) {
        console.error("Error during logout:", error);
        alert("An error occurred while logging out.");
    }
}

/**
 * Automatically validate session on specific pages
 */
document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname;

    if (currentPath.endsWith("admin-dashboard.html")) {
        validateSession();
    }
});
