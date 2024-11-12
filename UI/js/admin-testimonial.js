document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("testimonialForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form from refreshing the page on submit

        // Collect form data
        const clientName = document.getElementById("clientName").value.trim() || "Anonymous";
        const testimonialContent = document.getElementById("testimonialContent").value.trim() || "No testimonial provided.";
        const clientOccupation = document.getElementById("clientOccupation").value.trim() || "Client";
        const clientPhoto = document.getElementById("clientPhoto").files[0];

        // Initialize image path as a default if no image is uploaded
        let imagePath = "../assets/images/default.png";

        // If a file is uploaded, process the file for saving
        if (clientPhoto) {
            const reader = new FileReader();
            reader.onload = function (e) {
                // Save the image as a data URL (Base64) in localStorage
                imagePath = e.target.result;
                saveTestimonial(clientName, testimonialContent, clientOccupation, imagePath);
            };
            reader.readAsDataURL(clientPhoto);
        } else {
            // If no file uploaded, use default image path and save the testimonial
            saveTestimonial(clientName, testimonialContent, clientOccupation, imagePath);
        }
    });

    // Function to save the testimonial in localStorage
    function saveTestimonial(clientName, testimonialContent, clientOccupation, imagePath) {
        const newTestimonial = {
            clientName,
            testimonialContent,
            clientOccupation,
            imagePath
        };

        // Retrieve existing testimonials from localStorage or initialize as empty array
        let testimonials = JSON.parse(localStorage.getItem("testimonials")) || [];
        
        // Add new testimonial to the testimonials array
        testimonials.push(newTestimonial);

        // Save updated testimonials array to localStorage
        localStorage.setItem("testimonials", JSON.stringify(testimonials));

        // Clear the form after submission
        form.reset();

        // Provide feedback to the admin
        alert("Testimonial posted successfully!");
    }
});
