const isProduction = window.location.hostname === 'gogovillas.com' || window.location.hostname === 'www.gogovillas.com';

// Set the base URL accordingly
const API_BASE_URL = isProduction
    ? "https://backend-service-432219336422.us-central1.run.app/api/" // Production Backend
    : "http://localhost:8080/api/"; 

// Utility function to get query parameters from the URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        compoundId: params.get('compoundId'),
        arrivalDate: params.get('arrival_date'),
        departureDate: params.get('departure_date')
    };
}

// Function to render apartments on the page
function renderApartments(apartments, arrivalDate, departureDate) {
    const apartmentList = document.getElementById('apartmentList');
    apartmentList.innerHTML = ''; // Clear existing content

    if (!apartments || apartments.length === 0) {
        apartmentList.innerHTML = '<p>No available apartments in this compound for the selected dates.</p>';
        return;
    }

    const totalNights = Math.ceil(
        (new Date(departureDate) - new Date(arrivalDate)) / (1000 * 60 * 60 * 24)
    );

    apartments.forEach(apartment => {
        const price = apartment.price_per_night * totalNights;
        // Construct the base URL for the individual apartment details page
        const apartmentDetailsCleanUrl = `/apartment-details?apartmentName=${encodeURIComponent(apartment.name)}&arrival_date=${encodeURIComponent(arrivalDate)}&departure_date=${encodeURIComponent(departureDate)}`;

        let apartmentHTML;

        // Check if the apartment name is "Space for Partying" and use custom HTML for it
        if (apartment.name === "Space for Partying") {
            // Special HTML for "Space for Partying"
            apartmentHTML = `
            <div class="col-md-4 col-sm-6 mb-4">
                <div class="room">
                    <div class="room_img">
                        <figure>
                            <a href="${apartmentDetailsCleanUrl}">
                                <img src="${apartment.image}" class="card-img-top" alt="${apartment.name}">
                            </a>
                        </figure>
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${apartment.name}</h3>
                        <div class="ratings">
                            <span class="badge badge-primary rating-score">8.5</span>
                            <span class="rating-text">Excellent – 20 reviews</span>
                        </div>
                        <p class="card-location" onclick="window.location.href='https://www.google.com/maps/place/URUGANO+BREEZE+APARTMENTS/@-1.9910096,30.1748283,810m/data=!3m2!1e3!4b1!4m6!3m5!1s0x19db59711c1ff1bb:0xed219b0fe04ce09f!8m2!3d-1.991015!4d30.1774032!16s%2Fg%2F11h5kf7t8m?authuser=0&entry=ttu&g_ep=EgoyMDI0MTAyOS4wIKXMDSoASAFQAw%3D%3D'"><u>Kigali</u> · <u>Show on map</u></p>
                        <p class="distance">6.5 km from center</p>
                        <hr>
                        <div class="card-header">
                            <span class="recommended">Recommended for your group</span>
                        </div>
                        <p class="description-title">Space for Partying and Celebration</p>
                        <p class="description-text">A perfect space for Small parties like Kitchen party, bridal shower, birthdays with a beautiful view over the Lake</p>
                        <p class="price"><span class="final-pric"> Only Booked at the property!</span></p>
                        <div class="bt-div">
                            <button class="btn btn-primary" onclick="window.location.href='${apartmentDetailsCleanUrl}'">See Availability</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        } else {
            // Default HTML for other apartments
            apartmentHTML = `
            <div class="col-md-4 col-sm-6 mb-4">
                <div class="room">
                    <div class="room_img">
                        <figure>
                            <a href="${apartmentDetailsCleanUrl}">
                                <img src="${apartment.image}" class="card-img-top" alt="${apartment.name}">
                            </a>
                        </figure>
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${apartment.name}</h3>
                        <div class="ratings">
                            <span class="badge badge-primary rating-score">8.5</span>
                            <span class="rating-text">Excellent – 20 reviews</span>
                        </div>
                        <p class="card-location" onclick="window.location.href='https://www.google.com/maps/place/URUGANO+BREEZE+APARTMENTS/@-1.9910096,30.1748283,810m/data=!3m2!1e3!4b1!4m6!3m5!1s0x19db59711c1ff1bb:0xed219b0fe04ce09f!8m2!3d-1.991015!4d30.1774032!16s%2Fg%2F11h5kf7t8m?authuser=0&entry=ttu&g_ep=EgoyMDI0MTAyOS4wIKXMDSoASAFQAw%3D%3D'"><u>Kigali</u> · <u>Show on map</u></p>
                        <p class="distance">6.5 km from center</p>
                        <hr>
                        <div class="card-header">
                            <span class="recommended">Recommended for your group</span>
                        </div>
                        <p class="description-title">${apartment.rooms} Bedrooms Apartment</p>
                        <p class="description-text">Entire apartment · ${apartment.rooms} bedrooms · ${apartment.bathrooms} bathrooms</p>
                        <p class="nights">${totalNights} nights</p>
                        <p class="price"><span class="final-price">RWF${price.toFixed(0)}</span></p>
                        <div class="bt-div">
                            <button class="btn btn-primary" onclick="window.location.href='${apartmentDetailsCleanUrl}'">See Availability</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }
    
        // Append each apartment's HTML to the apartment list
        apartmentList.innerHTML += apartmentHTML;
    });
}

// Function to fetch available apartments
async function fetchAvailableApartments(compoundId, arrivalDate, departureDate) {
    try {
        const response = await fetch(`${API_BASE_URL}apartments/available-apartments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ compoundId, arrival_date: arrivalDate, departure_date: departureDate })
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('API Error Response:', errorResponse);
            throw new Error(errorResponse.message || "Failed to fetch available apartments.");
        }

        const data = await response.json();
        renderApartments(data.availableApartments, arrivalDate, departureDate);
    } catch (error) {
        console.error(error);
        document.getElementById('apartmentList').innerHTML = '<p class="error-1">An error occurred while fetching available apartments.</p>';
    }
}

// Redirect to compound page (This function will be triggered by "View Availability" from gogo-compounds.js)
// Now handles redirection to a clean URL for urugano_apartments
function redirectToCompound(compoundId, apartmentsJson) {
    try {
        const params = new URLSearchParams();
        params.append('compoundId', compoundId);
        params.append('apartments', apartmentsJson);

        // Include arrival and departure dates
        const { arrivalDate: globalArrivalDate, departureDate: globalDepartureDate } = getQueryParams(); // Use getQueryParams for current page's dates
        if (globalArrivalDate && globalDepartureDate) {
            params.append('arrival_date', globalArrivalDate);
            params.append('departure_date', globalDepartureDate);
        }

        // CORRECTED: Use the clean URL for urugano_apartments
        window.location.href = `/urugano-apartments?${params.toString()}`;
    } catch (error) {
        console.error('Error redirecting to compound page:', error);
    }
}

// Redirect to individual apartment page (This function is called by onclick from renderApartments)
// Now uses a clean URL for single apartment details
function redirectToApartment(apartmentName) {
    // Get the check-in and check-out dates from the current URL's query parameters
    const { arrivalDate, departureDate } = getQueryParams(); 

    if (!arrivalDate || !departureDate) {
        console.error("Arrival and departure dates are missing for redirectToApartment.");
        alert("Booking dates are required. Please go back and select your dates.");
        return;
    }

    // Replace spaces with `%20` (URL-encoded spaces) for the URL parameter
    const encodedApartmentName = encodeURIComponent(apartmentName.trim());
    
    // CORRECTED: Use a clean URL for the single apartment details page
    // Example: /apartment-details?apartmentName=Karisimbi%20Apartment&arrival_date=...&departure_date=...
    const url = `/apartment-details?apartmentName=${encodedApartmentName}&arrival_date=${encodeURIComponent(arrivalDate)}&departure_date=${encodeURIComponent(departureDate)}`;

    // Redirect to the specific apartment page with dates in the URL
    window.location.href = url;
}


// Handle search button click on this page (apartments.html)
document.getElementById('search-btn').addEventListener('click', () => {
    const arrivalDate = document.getElementById('checkin-date').value;
    const departureDate = document.getElementById('checkout-date').value;

    if (!arrivalDate || !departureDate) {
        alert("Please select both check-in and check-out dates.");
        return;
    }
    
    // CORRECTED: Redirect to its own clean URL, with updated dates
    const newUrl = `/apartments?arrival_date=${encodeURIComponent(arrivalDate)}&departure_date=${encodeURIComponent(departureDate)}`;
    window.location.href = newUrl;
});


// Initialize page (fetches apartments based on URL params on load)
document.addEventListener('DOMContentLoaded', () => {
    const { compoundId, arrivalDate, departureDate } = getQueryParams(); // Use getQueryParams to get dates from URL

    // Populate the search form with dates from URL
    if (arrivalDate) document.getElementById('checkin-date').value = arrivalDate;
    if (departureDate) document.getElementById('checkout-date').value = departureDate;

    // Only fetch if compoundId and dates are present
    if (compoundId && arrivalDate && departureDate) {
        fetchAvailableApartments(compoundId, arrivalDate, departureDate);
    } else if (arrivalDate && departureDate) {
        // If only dates are present (e.g., coming from homepage search, without compoundId)
        // You might want to fetch all apartments or show a general search result page.
        // For now, if no compoundId, it will log an error in fetchAvailableApartments, which is fine.
        console.warn("Compound ID is missing. Cannot fetch apartments for a specific compound.");
        // Optional: Add logic here to fetch all apartments if compoundId is not expected.
    } else {
        // If no dates, clear the apartment list
        document.getElementById('apartmentList').innerHTML = '<p>Please select dates to find available apartments.</p>';
    }
});
