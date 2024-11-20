import { searchCompounds } from './api.js';

// Select the form and listen for submission
const searchForm = document.getElementById('searchForm');

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page

    // Get form values
    const arrivalDate = document.getElementById('arrivalDate').value;
    const departureDate = document.getElementById('departureDate').value;

    // Validate inputs
    if (!arrivalDate || !departureDate) {
        alert('Please select both Arrival and Departure dates.');
        return;
    }

    if (new Date(arrivalDate) >= new Date(departureDate)) {
        alert('Departure date must be after Arrival date.');
        return;
    }

    // Prepare the data to send to the API
    const data = {
        arrival: arrivalDate,
        departure: departureDate,
    };

    try {
        // Call the backend API to search compounds
        const compounds = await searchCompounds(data);

        // Check if compounds are found
        if (compounds.length > 0) {
            // Store the search results and parameters in localStorage
            localStorage.setItem('searchResults', JSON.stringify(compounds));
            localStorage.setItem('searchParams', JSON.stringify(data));

            // Redirect to apartments.html
            window.location.href = 'html/apartments.html';
        } else {
            alert('No compounds available for the selected dates.');
        }
    } catch (error) {
        console.error('Error searching compounds:', error);
        alert('An error occurred while searching. Please try again.');
    }
});
