const express = require('express');
const router  = express.Router();

const { SearchRooms, BookRoom, MakePayment, ViewMyBookings, ViewSingleBooking } = require('../Controller/guestController');
const authMiddleware = require('../MiddleWare/authMiddleWare');

// all guest routes require the guest to be logged in
// authMiddleware checks the JWT token before allowing access

// Search available rooms — guest sends checkIn and checkOut as query params
// GET /api/guest/rooms/search?checkIn=2026-07-01&checkOut=2026-07-05
router.get('/rooms/search', authMiddleware, SearchRooms);

// Book a room — guest sends roomId, checkIn, checkOut in body
// POST /api/guest/bookings
router.post('/bookings', authMiddleware, BookRoom);

// Make payment for a booking
// POST /api/guest/bookings/:bookingId/pay
router.post('/bookings/:bookingId/pay', authMiddleware, MakePayment);

// View all my bookings
// GET /api/guest/bookings
router.get('/bookings', authMiddleware, ViewMyBookings);

// View a single booking detail
// GET /api/guest/bookings/:bookingId
router.get('/bookings/:bookingId', authMiddleware, ViewSingleBooking);

module.exports = router;
