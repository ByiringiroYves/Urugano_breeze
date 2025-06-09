const isProduction = window.location.hostname === 'gogovillas.com' || window.location.hostname === 'www.gogovillas.com';

// Set the base URL accordingly
const API_BASE_URL = isProduction
    ? "https://backend-service-432219336422.us-central1.run.app/api/" // Production Backend
    : "http://localhost:8080/api/";


// Function to get query parameters from the URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        arrivalDate: params.get('arrival_date'),
        departureDate: params.get('departure_date'),
        apartmentName: decodeURIComponent(params.get('apartmentName') || "").replace(/\+/g, " "),
    };
}


// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Extract the query parameters
    const { arrivalDate, departureDate, apartmentName } = getQueryParams();

    // Populate the search form with the extracted dates
    if (arrivalDate) document.getElementById('checkin-date').value = arrivalDate;
    if (departureDate) document.getElementById('checkout-date').value = departureDate;

    // Display the apartment name
    const apartmentHeader = document.querySelector("h1");
    if (apartmentName && apartmentHeader) {
        apartmentHeader.textContent = apartmentName;
    }

    // Check availability for the apartment
    if (arrivalDate && departureDate && apartmentName) {
        await checkApartmentAvailability(apartmentName, arrivalDate, departureDate);
    }
});

// Function to check apartment availability
async function checkApartmentAvailability(apartmentName, arrivalDate, departureDate) {
    try {
        const response = await fetch(`${API_BASE_URL}apartments/available-apartments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ arrival_date: arrivalDate, departure_date: departureDate }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('API Error Response:', errorResponse);
            throw new Error(errorResponse.message || "Failed to fetch apartment availability.");
        }

        const data = await response.json();

        // Check if the current apartment is in the list of available apartments
        const apartmentAvailable = data.availableApartments.some(apartment => apartment.name === apartmentName);

        if (apartmentAvailable) {
            // Calculate total price and display it
            const nights = Math.ceil((new Date(departureDate) - new Date(arrivalDate)) / (1000 * 60 * 60 * 24));
            const pricePerNight = data.availableApartments.find(apartment => apartment.name === apartmentName).price_per_night;
            const totalPrice = pricePerNight * nights;

            document.getElementById('final-price').textContent = `RWF${totalPrice.toFixed(0)}`;
            document.querySelector('.nights').textContent = ` / ${nights} nights`;
            
            // Additioal codes 
            const bookLink = document.getElementById('book-now-link');
            if (bookLink) {
                // Get current dates just in case they are needed for context on payment page
                const currentArrivalDate = document.getElementById('checkin-date').value;
                const currentDepartureDate = document.getElementById('checkout-date').value;

                // CORRECTED: Update the link's href with clean URL for userdata
                bookLink.href = `/userdata?apartmentName=${encodeURIComponent(apartmentName)}&totalAmount=${totalPrice.toFixed(0)}&arrival_date=${encodeURIComponent(currentArrivalDate)}&departure_date=${encodeURIComponent(currentDepartureDate)}`;
            }

        } else {
            // Mark as unavailable and hide the booking button
            document.querySelector('.btn-danger').style.display = 'none'; 
            document.querySelector('.price-box').style.display = 'none';     
            const errorMessage = document.createElement('p');
            errorMessage.textContent = ` We're sorry, the ${apartmentName} is fully booked for the selected dates`;
            errorMessage.classList.add('text-danger');
            document.querySelector('.d-flex').appendChild(errorMessage);
        }
    } catch (error) {
        console.error('Error checking apartment availability:', error);
        alert('An error occurred while checking availability.');
    }
}

document.getElementById('search-btn').addEventListener('click', () => {
    const arrivalDate = document.getElementById('checkin-date').value;
    const departureDate = document.getElementById('checkout-date').value;

    if (!arrivalDate || !departureDate) {
        alert("Please select both arrival and departure dates.");
        return;
    }

    // Extract the apartment name from the current page title (H1)
    const apartmentName = document.querySelector("h1").textContent.trim();
    // No need for formattedName for the URL path itself, just for param values if needed
    
    // CORRECTED: Redirect to the clean URL for the specific apartment details page
    // Example: /apartment-details?apartmentName=Karisimbi%20Apartment&arrival_date=...&departure_date=...
    const url = `/apartment-details?apartmentName=${encodeURIComponent(apartmentName)}&arrival_date=${encodeURIComponent(arrivalDate)}&departure_date=${encodeURIComponent(departureDate)}`;
    window.location.href = url;
});
