const isProduction = window.location.hostname === 'gogovillas.com' || window.location.hostname === 'www.gogovillas.com';

// Set the base URL accordingly
const API_BASE_URL = isProduction
    ? "https://backend-service-432219336422.us-central1.run.app/api/" // Production Backend
    : "http://localhost:8080/api/"; 

   //const API_BASE_URL = "https://backend-service-432219336422.us-central1.run.app/api/";
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

        let apartmentHTML;

        // Check if the apartment name is "Space for Partying" and use custom HTML for it
        if (apartment.name === "Space for Partying") {
            // Special HTML for "Space for Partying"
            apartmentHTML = `
            <div class="col-md-4 col-sm-6 mb-4">
                <div class="room">
                    <div class="room_img">
                        <figure>
                            <a href="javascript:void(0);" onclick="redirectToApartment('${apartment.name}')">
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
                            <button class="btn btn-primary" onclick="redirectToApartment('${apartment.name}')">See Availability</button>
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
                            <a href="javascript:void(0);" onclick="redirectToApartment('${apartment.name}')">
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
                        <p class="price"><span class="final-price">US$${price.toFixed(0)}</span></p>
                        <div class="bt-div">
                            <button class="btn btn-primary" onclick="redirectToApartment('${apartment.name}')">See Availability</button>
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

        if (!response.ok) throw new Error('Failed to fetch available apartments.');

        const data = await response.json();
        renderApartments(data.availableApartments, arrivalDate, departureDate);
    } catch (error) {
        console.error(error);
        document.getElementById('apartmentList').innerHTML = '<p class="error-1">An error occurred while fetching available apartments.</p>';
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    const { compoundId, arrivalDate, departureDate } = getQueryParams();

    if (!arrivalDate || !departureDate) {
        console.error('Missing arrival or departure date in URL parameters.');
        return;
    }

    // Populate the search form with arrival and departure dates
    document.getElementById('checkin-date').value = arrivalDate;
    document.getElementById('checkout-date').value = departureDate;

    // Fetch and render available apartments on page load
    fetchAvailableApartments(compoundId, arrivalDate, departureDate);
});

// Event listener for the search button
document.getElementById('search-btn').addEventListener('click', () => {
    const arrivalDate = document.getElementById('checkin-date').value;
    const departureDate = document.getElementById('checkout-date').value;
    const { compoundId } = getQueryParams();

    if (!arrivalDate || !departureDate) {
        alert('Please select both check-in and check-out dates.');
        return;
    }
    const newUrl = `urugano_apartments.html?arrival_date=${encodeURIComponent(arrivalDate)}&departure_date=${encodeURIComponent(departureDate)}`;
    window.location.href = newUrl;
    // Fetch and display available apartments based on new dates
   // fetchAvailableApartments(compoundId, arrivalDate, departureDate);
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
   const { arrival_date, departure_date } = getQueryParams();

   if (arrival_date) document.getElementById('checkin-date').value = arrival_date;
   if (departure_date) document.getElementById('checkout-date').value = departure_date;

   if (arrival_date && departure_date) {
      // fetchAvailableCompounds(arrival_date, departure_date);
       // Fetch and display available apartments based on new dates
    fetchAvailableApartments(compoundId, arrivalDate, departureDate);
   }
});

function redirectToApartment(apartmentName) {
    // Get the check-in and check-out dates
    const arrivalDate = document.getElementById('checkin-date').value;
    const departureDate = document.getElementById('checkout-date').value;

    // Replace spaces with `%20` (URL-encoded spaces) for the filename
    const formattedName = encodeURIComponent(apartmentName.trim());
    const url = `${formattedName}.html?arrival_date=${encodeURIComponent(arrivalDate)}&departure_date=${encodeURIComponent(departureDate)}&apartmentName=${formattedName}`;

    // Redirect to the specific apartment page with dates in the URL
    window.location.href = url;
}

