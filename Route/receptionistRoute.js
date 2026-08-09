const express = require('express');
const router  = express.Router();

const { ConfirmBooking, SearchGuestByUsername, MarkGuestCheckedIn, ReportIssue } = require('../Controller/receptionistController');
const authMiddleware  = require('../MiddleWare/authMiddleWare');
const isAdmin         = require('../MiddleWare/adminMiddleWare');

// all receptionist routes require login + receptionist/admin role
// authMiddleware → checks JWT token
// isAdmin        → checks role is receptionist or admin

// Confirm a booking (check if payment is made)
// GET /api/receptionist/bookings/:bookingId/confirm
router.get('/bookings/:bookingId/confirm', authMiddleware, isAdmin, ConfirmBooking);

// Search a guest by username
// GET /api/receptionist/guests/:username
router.get('/guests/:username', authMiddleware, isAdmin, SearchGuestByUsername);

// Mark guest as checked in
// PATCH /api/receptionist/bookings/:bookingId/checkin
router.patch('/bookings/:bookingId/checkin', authMiddleware, isAdmin, MarkGuestCheckedIn);

// Report an issue to admin
// POST /api/receptionist/issues
router.post('/issues', authMiddleware, isAdmin, ReportIssue);

module.exports = router;
