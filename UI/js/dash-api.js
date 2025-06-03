const isProduction = window.location.hostname === 'gogovillas.com' || window.location.hostname === 'www.gogovillas.com';

// Set the base URL accordingly
const API_BASE_URL = isProduction
    ? "https://backend-service-432219336422.us-central1.run.app/api/ashboard" // Production Backend
    : "http://localhost:8080/api/ashboard";

    const API_USER_URL = isProduction
    ?'https://backend-service-432219336422.us-central1.run.app/api/admin' // Backend URL for user-related APIs
    : "http://localhost:8080/api/admin";
//const API_BASE_URL = 'https://backend-service-432219336422.us-central1.run.app/api/dashboard'; // Backend URL for dashboard APIs
//const API_USER_URL = 'https://backend-service-432219336422.us-central1.run.app/api/admin'; // Backend URL for user-related APIs

/**
 * Store JWT token in localStorage
 */
function setToken(token) {
    localStorage.setItem("authToken", token);
}

/**
 * Retrieve JWT token from localStorage
 */
function getToken() {
    return localStorage.getItem("authToken");
}

/**
 * Clear JWT token from localStorage
 */
function clearToken() {
    localStorage.removeItem("authToken");
}

/**
 * Fetch and populate all dashboard data
 */
async function loadDashboardData() {
    try {
        // Fetch dashboard data first
        await Promise.all([
            fetchAndSetTotalBookings(),
            fetchAndSetActiveAdmins(),
            fetchAndSetRecentBookings(),
            fetchAndSetTopApartments(),
        ]);

        // Fetch user profile last to prevent interference
        await fetchAndSetUserProfile();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Error loading data. Redirecting to login.');
        window.location.href = 'admin.html';
    }
}

/**
 * Fetch total bookings and update DOM
 */
async function fetchAndSetTotalBookings() {
    try {
        const data = await fetchWithToken(`${API_BASE_URL}/total-bookings`);
        const totalBookingsElement = document.getElementById('totalBookings');
        if (totalBookingsElement) {
            totalBookingsElement.innerText = data.total;
        }
    } catch (error) {
        console.error('Error fetching total bookings:', error.message);
    }
}

/**
 * Fetch active admin users and update DOM
 */
async function fetchAndSetActiveAdmins() {
    try {
        const data = await fetchWithToken(`${API_BASE_URL}/active-admins`);
        const activeAdminsElement = document.getElementById('activeAdmins');
        if (activeAdminsElement) {
            activeAdminsElement.innerText = data.count;
        }
    } catch (error) {
        console.error('Error fetching active admins:', error.message);
    }
}

/**
 * Fetch recent bookings and update table
 */
async function fetchAndSetRecentBookings() {
    try {
        const data = await fetchWithToken(`${API_BASE_URL}/recent-bookings`);
        if (data.bookings && data.bookings.length > 0) {
            console.log('Fetched recent bookings:', data.bookings);
            populateRecentBookings(data.bookings);
        } else {
            console.warn('No recent bookings found.');
            populateRecentBookings([]); // Ensure the table is cleared
        }
    } catch (error) {
        console.error('Error fetching recent bookings:', error.message);
    }
}

/**
 * Fetch top booked apartment and update DOM
 */
async function fetchAndSetTopApartments() {
    const topApartmentsElement = document.getElementById('topApartments');

    // Check if the element exists in the DOM
    if (!topApartmentsElement) {
        console.error("Element with ID #topApartments is not found in the DOM.");
        return; // Exit early to avoid further errors
    }

    // Set a loading state
    topApartmentsElement.innerText = 'Loading...';

    try {
        // Fetch data from the API
        const data = await fetchWithToken(`${API_BASE_URL}/top-apartments`);
        console.log("Fetched Top Apartment Data:", data);

        // Handle the response and update DOM
        if (data && data.apartment && data.apartment.name) {
            topApartmentsElement.innerText = `${data.apartment.name} (${data.apartment.bookings} bookings)`;
        } else {
            topApartmentsElement.innerText = 'No top apartment found.';
            console.warn("API returned null or empty apartment data.");
        }
    } catch (error) {
        // Handle errors and update the UI accordingly
        console.error("Error in fetchAndSetTopApartments:", error.message);
        topApartmentsElement.innerText = 'Error loading top apartment.';
    }
}



/**
 * Fetch user profile and populate user details
 */
async function fetchAndSetUserProfile() {
    try {
        const data = await fetchWithToken(`${API_USER_URL}/profile`);
        populateUserDetails(data);
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
    }
}

/**
 * Centralized fetch function with JWT token validation
 */
async function fetchWithToken(url) {
    const token = getToken(); // Retrieve JWT token
    if (!token) {
        console.error('No authentication token found.');
        throw new Error('Authentication token missing.');
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Include JWT token
        },
    });

    if (!response.ok) {
        console.error(`API request failed: ${response.status}`, await response.text());
        const error = await response.json();
        if (response.status === 401) {
            clearToken(); // Clear token and redirect if unauthorized
            alert('Session expired. Redirecting to login.');
            window.location.href = 'admin.html';
        }
        throw new Error(error.error || 'Failed to fetch data.');
    }

    return response.json(); // Return parsed response
}


/**
 * Populate recent bookings table
 */
function populateRecentBookings(bookings) {
    const tbody = document.querySelector('.recent-bookings tbody');
    if (tbody) {
        tbody.innerHTML = ''; // Clear existing content
        bookings.forEach((booking) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.guest || 'N/A'}</td>
                <td>${booking.apartment_name || 'N/A'}</td>
                <td>${booking.book_date ? new Date(booking.book_date).toLocaleDateString() : 'Invalid Date'}</td>
                <td><span class="badge badge-${booking.status === 'Confirmed' ? 'success' : 'warning'}">${booking.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    } else {
        console.warn('Recent bookings table not found.');
    }
}


/**
 * Populate user details (avatar and dropdown)
 */
function populateUserDetails(user) {
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');

    if (user && user.fullName && user.email) {
        // Update user avatar
        if (userAvatar) {
            userAvatar.innerText = user.fullName
                .split(' ')
                .slice(0, 2)
                .map(name => name.charAt(0).toUpperCase())
                .join('');
        } else {
            console.warn('User avatar element not found.');
        }

        // Update user dropdown
        if (userDropdown) {
            userDropdown.innerHTML = `
                <div class="dropdown-item">
                    <strong>Full Name:</strong> ${user.fullName}
                </div>
                <div class="dropdown-item">
                    <strong>Email:</strong> ${user.email}
                </div>
                <div class="dropdown-item text-center">
                    <button class="btn btn-danger btn-sm" onclick="logout()">Logout</button>
                </div>
            `;
        }
    }
}

/**
 * Toggle user dropdown visibility
 */
document.getElementById('userAvatar')?.addEventListener('click', () => {
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) userDropdown.classList.toggle('active');
});

/**
 * Logout function
 */
function logout() {
    fetch(`${API_USER_URL}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
        },
    })
        .then((response) => {
            if (response.ok) {
                alert('Logged out successfully!');
                clearToken();
                window.location.href = 'admin.html';
            } else {
                return response.json().then((data) => {
                    throw new Error(data.error || 'Logout failed.');
                });
            }
        })
        .catch((error) => {
            console.error('Error during logout:', error.message);
        });
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', loadDashboardData);
