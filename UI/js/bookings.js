// Function to fetch and display bookings
const isProduction = window.location.hostname === 'gogovillas.com' || window.location.hostname === 'www.gogovillas.com';

// Set the base URL accordingly
const API_BASE_URL = isProduction
    ? "https://backend-service-432219336422.us-central1.run.app/api/bookings" // Production Backend
    : "http://localhost:8080/api/bookings"; 

async function fetchBookings() {
    try {
        const response = await fetch(`${API_BASE_UR}`);
        if (!response.ok) {
            throw new Error("Failed to fetch bookings.");
        }

        const bookings = await response.json();
        const tableBody = document.querySelector("#bookingsTable tbody");

        // Clear existing rows
        tableBody.innerHTML = "";

        // Populate table with booking data
        bookings.forEach((booking) => {
            const row = document.createElement("tr");

            // Determine the status color class
            const statusClass = booking.status === "Confirmed"
                ? "status-confirmed"
                : booking.status === "Canceled"
                ? "status-canceled"
                : "";

            row.innerHTML = `
                <td>${booking.reservation_id || "N/A"}</td>
                <td>${booking.apartment_name || "N/A"}</td>
                <td>${booking.guest || "N/A"}</td>
                <td>${booking.email || "N/A"}</td>
                <td>${booking.phone || "N/A"}</td>
                <td>${booking.country || "N/A"}</td>
                <td>${booking.city || "N/A"}</td>
                <td class="book-date">${formatDateTime(booking.book_date) || "N/A"}</td>
                <td>${formatDate(booking.arrival_date) || "N/A"}</td>
                <td>${formatDate(booking.departure_date) || "N/A"}</td>
                <td>${booking.nights || "N/A"}</td>
                <td>${booking.total_price ? `${booking.currency || "US$"}${booking.total_price}` : "N/A"}</td>
                <td class="status ${statusClass}">${booking.status || "N/A"}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        alert("Failed to load bookings. Please try again later.");
    }
}

// Fetch bookings when the page loads
document.addEventListener("DOMContentLoaded", fetchBookings);

// Utility functions for formatting dates
function formatDateTime(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
