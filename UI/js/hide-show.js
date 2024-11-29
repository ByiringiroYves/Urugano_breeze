// Function to toggle password visibility
function togglePassword(inputId, buttonId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = document.getElementById(buttonId);

    toggleButton.addEventListener("click", () => {
        const isPasswordVisible = passwordInput.type === "text";
        passwordInput.type = isPasswordVisible ? "password" : "text";

        // Update the icon class for better UX
        const icon = toggleButton.querySelector("i");
        if (isPasswordVisible) {
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        } else {
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        }
    });
}

// Initialize toggles for both password fields
togglePassword("password", "toggle-password");
togglePassword("confirmPassword", "toggle-password-1");
