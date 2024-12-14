const Booking = require('../models/Booking');
const Admin = require('../models/Admin');
const Apartment = require('../models/Apartment');
const mongoose = require('mongoose');

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
        // Fetch the 6 most recent bookings by `book_date` in descending order
        const recentBookings = await Booking.find()
            .sort({ book_date: -1 }) // Sort by `book_date` field in descending order
            .limit(6) // Limit to 6 records
            .select('guest apartment_name book_date status'); // Select relevant fields

        console.log('Fetched Bookings:', recentBookings); // Debugging: Log the fetched data

        // Format the bookings for the frontend
        const formattedBookings = recentBookings.map(booking => ({
            guest: booking.guest || 'Unknown', // Fallback if guest is null
            apartment_name: booking.apartment_name || 'Not Specified', // Correct field name
            book_date: booking.book_date ? booking.book_date.toISOString().split('T')[0] : 'N/A', // Correct date formatting
            status: booking.status || 'Pending', // Fallback for status
        }));

        console.log('Formatted Bookings:', formattedBookings); // Debugging: Log the formatted data

        // Send the formatted response
        res.json({ bookings: formattedBookings });
    } catch (error) {
        console.error('Error fetching recent bookings:', error);
        res.status(500).json({ error: 'Failed to fetch recent bookings' });
    }
};



// Top apartments by bookings

exports.getTopApartments = async (req, res) => {
    try {
        const topApartment = await Booking.aggregate([
            {
                $group: {
                    _id: '$apartment_id', // Group by apartment_id
                    count: { $sum: 1 },  // Count the number of bookings
                },
            },
            { $sort: { count: -1 } }, // Sort by count in descending order
            { $limit: 1 }, // Limit to top 1 apartment
            {
                $lookup: {
                    from: 'apartments',        // Join with apartments collection
                    localField: '_id',         // Match _id in bookings to _id in apartments
                    foreignField: '_id',
                    as: 'apartmentDetails',
                },
            },
            { $unwind: '$apartmentDetails' }, // Flatten the apartment details array
            {
                $project: {
                    _id: 0, // Exclude _id
                    apartmentName: '$apartmentDetails.name',
                    bookings: '$count', // Include the number of bookings
                },
            },
        ]);

        if (!topApartment.length) {
            return res.json({ apartment: null });
        }

        // Remove the word "Apartment" from the name
        const sanitizedApartmentName = topApartment[0].apartmentName.replace(/Apartment/i, '').trim();

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            apartment: {
                name: sanitizedApartmentName,
                bookings: topApartment[0].bookings,
            },
        });        
    } catch (error) {
        console.error('Error fetching top apartment:', error);
        res.status(500).json({ error: 'Failed to fetch top apartment' });
    }
};





