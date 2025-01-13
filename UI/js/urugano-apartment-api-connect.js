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
        const response = await fetch('https://gogovillas.com/api/apartments/available-apartments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ arrival_date: arrivalDate, departure_date: departureDate }),
        });

        if (!response.ok) throw new Error('Failed to fetch apartment availability.');

        const data = await response.json();

        // Check if the current apartment is in the list of available apartments
        const apartmentAvailable = data.availableApartments.some(apartment => apartment.name === apartmentName);

        if (apartmentAvailable) {
            // Calculate total price and display it
            const nights = Math.ceil((new Date(departureDate) - new Date(arrivalDate)) / (1000 * 60 * 60 * 24));
            const pricePerNight = data.availableApartments.find(apartment => apartment.name === apartmentName).price_per_night;
            const totalPrice = pricePerNight * nights;

            document.getElementById('final-price').textContent = `US$${totalPrice.toFixed(0)}`;
            document.querySelector('.nights').textContent = ` / ${nights} nights`;
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

    // Extract the apartment name from the current page
    const apartmentName = document.querySelector("h1").textContent.trim();
    const formattedName = apartmentName.replace(/\s+/g, '%20'); // Replace spaces with underscores or other valid characters
    // Redirect with query params
    const targetFile = `${formattedName}.html`;
    window.location.href = `${targetFile}?apartmentName=${encodeURIComponent(apartmentName)}&arrival_date=${encodeURIComponent(arrivalDate)}&departure_date=${encodeURIComponent(departureDate)}`;
});

