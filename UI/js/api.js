const API_BASE_URL = 'http://localhost:5000/api';

// Function to search for compounds
async function searchCompounds(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/compounds/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error) {
        console.error('Error searching compounds:', error);
        throw error;
    }
}

// Function to search apartments in a compound
async function searchApartmentsInCompound(compoundId, data) {
    try {
        const response = await fetch(`${API_BASE_URL}/compounds/${compoundId}/apartments/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error) {
        console.error('Error searching apartments:', error);
        throw error;
    }
}

// Function to search for a specific apartment
async function searchSpecificApartment(apartmentId, data) {
    try {
        const response = await fetch(`${API_BASE_URL}/apartments/${apartmentId}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error) {
        console.error('Error searching specific apartment:', error);
        throw error;
    }
}

// Export functions to be used in other scripts
export { searchCompounds, searchApartmentsInCompound, searchSpecificApartment };
