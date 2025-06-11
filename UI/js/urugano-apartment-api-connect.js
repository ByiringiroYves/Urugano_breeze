const isProduction = window.location.hostname === 'gogovillas.com' || window.location.hostname === 'www.gogovillas.com';

const API_BASE_URL = isProduction
    ? "https://backend-service-432219336422.us-central1.run.app/api/"
    : "http://localhost:8080/api/";

// ✅ Extracts query parameters with fallback to both snake_case and camelCase
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        arrivalDate: params.get('arrival_date') || params.get('arrivalDate'),
        departureDate: params.get('departure_date') || params.get('departureDate'),
        apartmentName: decodeURIComponent(params.get('apartmentName') || "").replace(/\+/g, " "),
    };
}

document.addEventListener('DOMContentLoaded', async () => {
    const { arrivalDate, departureDate, apartmentName } = getQueryParams();

    const checkinDateInput = document.getElementById('checkin-date');
    const checkoutDateInput = document.getElementById('checkout-date');

    if (checkinDateInput) checkinDateInput.value = arrivalDate || "";
    if (checkoutDateInput) checkoutDateInput.value = departureDate || "";

    const apartmentHeader = document.querySelector("h1");
    if (apartmentName && apartmentHeader) {
        apartmentHeader.textContent = apartmentName;
    }

    if (arrivalDate && departureDate && apartmentName) {
        await checkApartmentAvailability(apartmentName, arrivalDate, departureDate);
    } else {
        const priceBox = document.querySelector('.price-box');
        const bookLink = document.getElementById('book-now-link');
        const availabilityMessage = document.querySelector('.availability-message');

        if (priceBox) priceBox.style.display = 'none';
        if (bookLink) bookLink.style.display = 'none';
        if (availabilityMessage) availabilityMessage.textContent = 'Please provide valid dates and apartment name in the URL.';
    }
});

async function checkApartmentAvailability(apartmentName, arrivalDate, departureDate) {
    const availabilityMessage = document.querySelector('.availability-message');
    const finalPriceSpan = document.getElementById('final-price');
    const nightsSpan = document.querySelector('.nights');
    const bookLink = document.getElementById('book-now-link');
    const priceBox = document.querySelector('.price-box');

    if (availabilityMessage) availabilityMessage.textContent = 'Checking availability...';
    if (bookLink) bookLink.style.display = 'none';
    if (priceBox) priceBox.style.display = 'none';

    try {
        // ✅ Get apartment details (case-insensitive)
        const apartmentDetailsResponse = await fetch(`${API_BASE_URL}apartments?name=${encodeURIComponent(apartmentName)}`);
        if (!apartmentDetailsResponse.ok) {
            const errorData = await apartmentDetailsResponse.json();
            throw new Error(errorData.error || `Could not find details for ${apartmentName}.`);
        }

        const apartmentDetails = await apartmentDetailsResponse.json();

        // ✅ Check availability
        const availabilityResponse = await fetch(`${API_BASE_URL}apartments/check-availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apartment_name: apartmentName,
                arrival_date: arrivalDate,
                departure_date: departureDate
            }),
        });

        const availabilityData = await availabilityResponse.json();

        // ✅ Set apartment info
        const apartmentPageTitle = document.querySelector("h1");
        if (apartmentPageTitle) apartmentPageTitle.textContent = apartmentDetails.name;

        const imageGallery = document.querySelector(".image-gallery");
        if (imageGallery) {
            if (apartmentDetails.image) {
                imageGallery.innerHTML = `<img src="${apartmentDetails.image}" alt="${apartmentDetails.name}">`;
            } else {
                imageGallery.innerHTML = `<img src="/assets/images/default.png" alt="No image available">`;
            }
        }

        const apartmentDescription = document.querySelector(".description");
        if (apartmentDescription) {
            apartmentDescription.innerHTML = `<p>${apartmentDetails.description || 'No description available.'}</p>`;
        }

        // ✅ Show availability result
        if (availabilityResponse.ok && availabilityData.message?.includes("is available")) {
            const nights = Math.ceil((new Date(departureDate) - new Date(arrivalDate)) / (1000 * 60 * 60 * 24));
            const totalPrice = apartmentDetails.price_per_night * nights;

            if (finalPriceSpan) finalPriceSpan.textContent = `RWF${totalPrice.toFixed(0)}`;
            if (nightsSpan) nightsSpan.textContent = ` / ${nights} nights`;

            if (bookLink) {
                bookLink.href = `userdata.html?apartmentName=${encodeURIComponent(apartmentDetails.name)}&totalAmount=${totalPrice.toFixed(0)}&arrival_date=${encodeURIComponent(arrivalDate)}&departure_date=${encodeURIComponent(departureDate)}`;
                bookLink.style.display = 'inline-block';
            }

            if (priceBox) priceBox.style.display = 'block';
            if (availabilityMessage) availabilityMessage.textContent = '';
        } else {
            if (availabilityMessage) {
                availabilityMessage.textContent = availabilityData.error || `We're sorry, ${apartmentName} is fully booked for the selected dates.`;
            }
        }
    } catch (error) {
        console.error('Error checking apartment availability:', error);
        if (availabilityMessage) availabilityMessage.textContent = `An error occurred while checking availability: ${error.message}`;
    }
}

document.getElementById('search-btn')?.addEventListener('click', () => {
    const arrivalDate = document.getElementById('checkin-date')?.value;
    const departureDate = document.getElementById('checkout-date')?.value;

    if (!arrivalDate || !departureDate) {
        alert("Please select both arrival and departure dates.");
        return;
    }

    const apartmentName = document.querySelector("h1")?.textContent.trim();
    const formattedName = encodeURIComponent(apartmentName);

    const url = `${formattedName}.html?arrival_date=${encodeURIComponent(arrivalDate)}&departure_date=${encodeURIComponent(departureDate)}&apartmentName=${formattedName}`;
    window.location.href = url;
});
