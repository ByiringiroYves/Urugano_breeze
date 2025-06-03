const isProduction = window.location.hostname === 'gogovillas.com' || window.location.hostname === 'www.gogovillas.com';

// Set the base URL accordingly
const API_BASE_URL = isProduction
    ? "https://backend-service-432219336422.us-central1.run.app/api/testimonials/" // Production Backend
    : "http://localhost:8080/api/testimonials/"; 


//const API_BASE_URL = "https://backend-service-432219336422.us-central1.run.app/api/testimonials/"; // Correct URL

// Function to fetch testimonials and render them
async function loadTestimonials() {
    try {
        // Fetch testimonials from the API
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error("Failed to fetch testimonials");
        }

        // Parse the JSON response
        const testimonials = await response.json();

        // Get the testimonials container
        const testimonialList = document.getElementById("testimonialList");

        // Clear any existing testimonials
        testimonialList.innerHTML = "";

        // Loop through the testimonials and create HTML content
        testimonials.forEach((testimonial) => {
            // Create a new slide
            const slide = document.createElement("div");
            slide.classList.add("swiper-slide");

            // Add content to the slide
            slide.innerHTML = `
                <div class="testimonial">
                    <div class="testimonial-image">
                        <img src="${testimonial.client_photo ? testimonial.client_photo : '../assets/icons/default.png'}" alt="${testimonial.client_name}">
                    </div>
                    <div class="testimonial-content">
                        <h3>${testimonial.client_name}</h3>
                        <p>"${testimonial.content}"</p>
                        <span>${testimonial.client_occupation}</span>
                    </div>
                </div>
            `;

            // Append the slide to the swiper wrapper
            testimonialList.appendChild(slide);
        });

        // Initialize Swiper after content is added
        new Swiper(".swiper-container", {
            slidesPerView: 3,
            spaceBetween: 20,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
        });

    } catch (error) {
        console.error("Error loading testimonials:", error);
        alert("Failed to load testimonials. Please try again later.");
    }
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", loadTestimonials);
