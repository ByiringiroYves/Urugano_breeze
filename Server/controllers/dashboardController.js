const Booking = require('../models/Booking');
const Admin = require('../models/Admin');
const Apartment = require('../models/Apartment');

// Total bookings
exports.getTotalBookings = async (req, res) => {
    try {
        const total = await Booking.countDocuments();
        res.json({ total });
    } catch (error) {
        console.error('Error fetching total bookings:', error);
        res.status(500).json({ error: 'Failed to fetch total bookings' });
    }
};

// Active admin users
exports.getActiveAdmins = async (req, res) => {
    try {
        const activeAdmins = await Admin.countDocuments({ isActive: true });
        res.json({ count: activeAdmins });
    } catch (error) {
        console.error('Error fetching active admins:', error);
        res.status(500).json({ error: 'Failed to fetch active admins' });
    }
};

// Recent bookings
exports.getRecentBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .sort({ bookDate: -1 })
            .limit(5) // Fetch the 5 most recent bookings
            .select('guest apartment bookDate status');
        res.json({ bookings });
    } catch (error) {
        console.error('Error fetching recent bookings:', error);
        res.status(500).json({ error: 'Failed to fetch recent bookings' });
    }
};

// Top apartments by bookings
exports.getTopApartments = async (req, res) => {
    try {
        const topApartments = await Booking.aggregate([
            {
                $group: {
                    _id: '$apartment',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }, // Sort by count in descending order
            { $limit: 3 } // Get top 3 apartments
        ]);
        const apartments = topApartments.map(apartment => apartment._id);
        res.json({ apartments });
    } catch (error) {
        console.error('Error fetching top apartments:', error);
        res.status(500).json({ error: 'Failed to fetch top apartments' });
    }
};



