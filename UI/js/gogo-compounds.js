const isProduction = window.location.hostname === 'gogovillas.com' || window.location.hostname === 'www.gogovillas.com';

// Set the base URL accordingly
const API_BASE_URL = isProduction
    ? "https://backend-service-432219336422.us-central1.run.app/api/" // Production Backend
    : "http://localhost:8080/api/"; 

// Utility function to get query parameters from the URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        arrivalDate: params.get('arrival_date'),
        departureDate: params.get('departure_date'),
    };
}

// Function to fetch and render available compounds
async function fetchAndRenderAvailableCompounds(arrivalDate, departureDate) { // Renamed for clarity
    try {
        // API call to search compounds
        const response = await fetch(`${API_BASE_URL}compounds/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ arrival_date: arrivalDate, departure_date: departureDate }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('API Error Response (Compounds):', errorResponse);
            throw new Error(errorResponse.message || "Failed to fetch available compounds.");
        }

        const { compounds } = await response.json();
        renderAvailableCompounds(compounds, arrivalDate, departureDate);
    } catch (error) {
        console.error('Error Fetching Compounds:', error);
        document.getElementById('apartmentList').innerHTML = "<p>An error occurred while fetching available compounds.</p>";
    }
}

// Function to render available compounds (used on /apartments page)
function renderAvailableCompounds(compounds, arrivalDate, departureDate) {
    const apartmentList = document.getElementById('apartmentList');
    apartmentList.innerHTML = ""; // Clear existing content

    if (compounds.length === 0) {
        apartmentList.innerHTML = "<p>No available compounds found for the selected dates.</p>";
        return;
    }

    const totalNights = Math.ceil((new Date(departureDate) - new Date(arrivalDate)) / (1000 * 60 * 60 * 24));

    compounds.forEach(compound => {
        // Ensure compound.compound exists and has image before rendering
        const compoundImage = compound.compound.image || '/assets/images/default.png'; // Fallback image if missing
        const finalPrice = compound.compound.price_per_night * totalNights;

        const compoundHTML = `
          <div class="col-md-4 col-sm-6 apartment-item">
            <div id="serv_hover" class="room">
               <div class="room_img">
                   <figure>
                      <a href="javascript:void(0);" onclick="redirectToCompound('${compound.compound._id}', '${encodeURIComponent(JSON.stringify(compound.apartments))}')">
                         <img src="${compoundImage}" alt="${compound.compound.name}">
                      </a>
                   </figure>
                </div>
                <div class="bed_room">
                   <h3>${compound.compound.name}</h3>
                   <p class="location">${compound.compound.location}</p>
                   <p class="night">${totalNights} nights</p>
                   <p class="price-o"><span class="final-price">US$${finalPrice.toFixed(0)}</span></p>
                   <button class="av-btn" onclick="redirectToCompound('${compound.compound._id}', '${encodeURIComponent(JSON.stringify(compound.apartments))}')"> View Availability</button>
                </div>
             </div>
          </div>
        `;
        apartmentList.innerHTML += compoundHTML;
    });
}

// Redirect to compound page (This function will be triggered by "View Availability" from a compound card)
function redirectToCompound(compoundId, apartmentsJson) {
    try {
        const params = new URLSearchParams();
        params.append('compoundId', compoundId);
        params.append('apartments', apartmentsJson);

        // Include arrival and departure dates from the current URL if available (from /apartments?...)
        const { arrivalDate: globalArrivalDate, departureDate: globalDepartureDate } = getQueryParams(); 
        if (globalArrivalDate && globalDepartureDate) {
            params.append('arrival_date', globalArrivalDate);
            params.append('departure_date', globalDepartureDate);
        }

        // CORRECTED: Use the clean URL for urugano-apartments
        window.location.href = `/urugano-apartments?${params.toString()}`;
    } catch (error) {
        console.error('Error redirecting to compound page:', error);
    }
}

// Handle search button click on /apartments page
document.getElementById('search-btn').addEventListener('click', () => {
    const arrivalDate = document.getElementById('checkin-date').value;
    const departureDate = document.getElementById('checkout-date').value;

    if (!arrivalDate || !departureDate) {
        alert("Please select both check-in and check-out dates.");
        return;
    }

    // Redirect to the clean URL /apartments with new dates
    const newUrl = `/apartments?arrival_date=${encodeURIComponent(arrivalDate)}&departure_date=${encodeURIComponent(departureDate)}`;
    window.location.href = newUrl;
});

// Initialize page for /apartments (main compounds listing page)
document.addEventListener('DOMContentLoaded', () => {
    // This script should only run its main logic if on the /apartments page
    if (window.location.pathname === '/apartments') {
        const { arrivalDate, departureDate } = getQueryParams();

        // Populate the search/date inputs
        if (arrivalDate) document.getElementById('checkin-date').value = arrivalDate;
        if (departureDate) document.getElementById('checkout-date').value = departureDate;

        // Fetch and render available compounds
        if (arrivalDate && departureDate) {
            fetchAndRenderAvailableCompounds(arrivalDate, departureDate);
        } else {
            // If no dates, clear the apartment list or show a message
            document.getElementById('apartmentList').innerHTML = '<p>Please select dates to find available compounds.</p>';
        }
    }
});
