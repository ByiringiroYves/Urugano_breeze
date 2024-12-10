const API_BASE_URL = 'http://localhost:5000/api/dashboard'; // Backend URL for dashboard APIs
const API_USER_URL = 'http://localhost:5000/api/admin'; // Backend URL for user-related APIs

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
        await Promise.all([
            fetchAndSetTotalBookings(),
            fetchAndSetActiveAdmins(),
            fetchAndSetRecentBookings(),
            fetchAndSetTopApartments(),
        ]);
        fetchAndSetUserProfile();
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
        populateRecentBookings(data.bookings);
    } catch (error) {
        console.error('Error fetching recent bookings:', error.message);
    }
}

/**
 * Fetch top 3 apartments and update DOM
 */
async function fetchAndSetTopApartments() {
    try {
        const data = await fetchWithToken(`${API_BASE_URL}/top-apartments`);
        const topApartmentsElement = document.getElementById('topApartments');
        if (topApartmentsElement) {
            topApartmentsElement.innerText = data.apartments.join(', ');
        }
    } catch (error) {
        console.error('Error fetching top apartments:', error.message);
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
    const token = getToken();
    if (!token) throw new Error('Authentication token is missing.');

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
            clearToken();
            alert('Session expired. Redirecting to login.');
            window.location.href = 'admin.html';
        }
        throw new Error(errorData.error || 'Failed to fetch data.');
    }
    return response.json();
}

/**
 * Populate recent bookings table
 */
function populateRecentBookings(bookings) {
    const tbody = document.querySelector('.recent-bookings tbody');
    if (tbody) {
        tbody.innerHTML = '';
        bookings.forEach((booking) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.guest || 'N/A'}</td>
                <td>${booking.apartment || 'N/A'}</td>
                <td>${booking.bookDate ? new Date(booking.bookDate).toLocaleDateString() : 'Invalid Date'}</td>
                <td><span class="badge badge-${booking.status === 'Confirmed' ? 'success' : 'warning'}">${booking.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    }
}

/**
 * Populate user details (avatar and dropdown)
 */
function populateUserDetails(user) {
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');

    if (user && user.fullName && user.email) {
        if (userAvatar) {
            userAvatar.innerText = user.fullName
            .split(' ')
            .slice(0, 2) // Fetch first two words
            .map(name => name.charAt(0).toUpperCase()) // Get the first letter and capitalize it
            .join(''); // Combine the letters into a string
        } else {
            console.warn('User avatar element not found.');
        }
        
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
