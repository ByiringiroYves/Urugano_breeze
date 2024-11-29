// Utility function to get query parameters from the URL
// Utility function to get query parameters from the URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        arrival_date: params.get('arrival_date'),
        departure_date: params.get('departure_date'),
    };
 }
 
 // Function to fetch and render available compounds
 async function fetchAvailableCompounds(arrivalDate, departureDate) {
    try {
        const response = await fetch('http://localhost:5000/api/compounds/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ arrival_date: arrivalDate, departure_date: departureDate }),
        });
 
        if (!response.ok) throw new Error("Failed to fetch available compounds.");
 
        const { compounds } = await response.json();
        renderAvailableCompounds(compounds, arrivalDate, departureDate);
    } catch (error) {
        console.error(error);
        document.getElementById('apartmentList').innerHTML = "<p>An error occurred while fetching available compounds.</p>";
    }
 }
 
 // Function to render available compounds
 function renderAvailableCompounds(compounds, arrivalDate, departureDate) {
    const apartmentList = document.getElementById('apartmentList');
    apartmentList.innerHTML = ""; // Clear existing content
 
    if (compounds.length === 0) {
        apartmentList.innerHTML = "<p>No available compounds found for the selected dates.</p>";
        return;
    }
 
    const totalNights = Math.ceil((new Date(departureDate) - new Date(arrivalDate)) / (1000 * 60 * 60 * 24));
 
    compounds.forEach(compound => {
        const finalPrice = compound.compound.price_per_night * totalNights;
 
        const compoundHTML = `
          <div class="col-md-4 col-sm-6 apartment-item">
            <div id="serv_hover" class="room">
               <div class="room_img">
                   <figure>
                      <a href="javascript:void(0);" onclick="redirectToCompound('${compound.compound._id}', '${encodeURIComponent(JSON.stringify(compound.apartments))}')">
                         <img src="${compound.compound.image}" alt="${compound.compound.name}">
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
 
 // Redirect to compound page
 function redirectToCompound(compoundId, apartments) {
    try {
        const params = new URLSearchParams();
        params.append('compoundId', compoundId);
        params.append('apartments', apartments);
 
        // Include arrival and departure dates
        const { arrival_date, departure_date } = getQueryParams();
        if (arrival_date && departure_date) {
            params.append('arrival_date', arrival_date);
            params.append('departure_date', departure_date);
        }
 
        window.location.href = `urugano_apartments.html?${params.toString()}`;
    } catch (error) {
        console.error('Error redirecting to compound page:', error);
    }
 }
 
 // Handle search form submission
 document.getElementById('search-btn').addEventListener('click', () => {
    const arrivalDate = document.getElementById('checkin-date').value;
    const departureDate = document.getElementById('checkout-date').value;
 
    if (!arrivalDate || !departureDate) {
        alert("Please select both check-in and check-out dates.");
        return;
    }
 
    const newUrl = `apartments.html?arrival_date=${encodeURIComponent(arrivalDate)}&departure_date=${encodeURIComponent(departureDate)}`;
    window.location.href = newUrl;
 });
 
 // Initialize page
 document.addEventListener('DOMContentLoaded', () => {
    const { arrival_date, departure_date } = getQueryParams();
 
    if (arrival_date) document.getElementById('checkin-date').value = arrival_date;
    if (departure_date) document.getElementById('checkout-date').value = departure_date;
 
    if (arrival_date && departure_date) {
        fetchAvailableCompounds(arrival_date, departure_date);
    }
 });