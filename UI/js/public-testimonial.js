async function loadTestimonials() {
    // Determine if the environment is production or development
    const isProduction = window.location.hostname === 'gogovillas.com' || window.location.hostname === 'www.gogovillas.com';

    // API_DATA_URL for fetching testimonial data
    const API_DATA_URL = isProduction
        ? "https://backend-service-432219336422.us-central1.run.app/api/testimonials/" // Production Backend
        : "http://localhost:8080/api/testimonials/"; // Development Backend

    // Base URL for constructing image paths, assuming images are served from the backend's root domain
    const IMAGE_HOST_URL = isProduction
        ? "https://backend-service-432219336422.us-central1.run.app" // CORRECTED: Production Backend Host
        : "http://localhost:8080"; // Development Backend Host

    try {
        // Fetch testimonials from the API
        const response = await fetch(API_DATA_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch testimonials. Status: ${response.status}`);
        }

        // Parse the JSON response
        const testimonials = await response.json();

        // Get the testimonials container
        const testimonialList = document.getElementById("testimonialList");
        if (!testimonialList) {
            console.error("Testimonial list container 'testimonialList' not found.");
            return;
        }

        // Clear any existing testimonials
        testimonialList.innerHTML = "";

        if (testimonials.length === 0) {
            testimonialList.innerHTML = "<p>No testimonials yet.</p>";
            return;
        }

        // Loop through the testimonials and create HTML content
        testimonials.forEach((testimonial) => {
            const slide = document.createElement("div");
            slide.classList.add("swiper-slide");

            let imageUrl = '../assets/icons/default.png'; // Default image path

            if (testimonial.client_photo) {
                if (testimonial.client_photo.startsWith('http://') || testimonial.client_photo.startsWith('https://')) {
                    imageUrl = testimonial.client_photo; // It's already a full URL
                } else {
                    // Assume it's a relative path from the backend's static serving root
                    const imagePath = testimonial.client_photo.startsWith('/') 
                                      ? testimonial.client_photo 
                                      : `/${testimonial.client_photo}`; // Ensure it starts with a slash
                    imageUrl = IMAGE_HOST_URL + imagePath;
                }
            }

            slide.innerHTML = `
                <div class="testimonial">
                    <div class="testimonial-image">
                        <img src="${imageUrl}" 
                             alt="${testimonial.client_name || 'Client photo'}" 
                             onerror="this.onerror=null; this.src='../assets/icons/default.png';">
                    </div>
                    <div class="testimonial-content">
                        <h3>${testimonial.client_name || "Anonymous"}</h3>
                        <p>"${testimonial.content || "No content."}"</p>
                        <span><b>${testimonial.client_occupation || "Valued Customer"}</b></span>
                    </div>
                </div>
            `;
            testimonialList.appendChild(slide);
        });

        // Initialize Swiper after content is added
        if (typeof Swiper !== 'undefined' && document.querySelector(".swiper-container")) {
            new Swiper(".swiper-container", {
                slidesPerView: 3,
                spaceBetween: 20,
                breakpoints: {
                    320: { slidesPerView: 1, spaceBetween: 10 },
                    640: { slidesPerView: 2, spaceBetween: 15 },
                    1024: { slidesPerView: 3, spaceBetween: 20 }
                },
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
            });
        } else {
            console.warn("Swiper library or .swiper-container not found. Swiper not initialized.");
        }

    } catch (error) {
        console.error("Error loading testimonials:", error);
        const testimonialList = document.getElementById("testimonialList");
        if (testimonialList) {
            testimonialList.innerHTML = `<p style="color:red;">Failed to load testimonials: ${error.message}. Please try again later.</p>`;
        } else {
            alert(`Failed to load testimonials: ${error.message}`);
        }
    }
}

document.addEventListener("DOMContentLoaded", loadTestimonials);
