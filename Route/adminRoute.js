const express = require('express');
const router  = express.Router();
const { ConfirmPayment, AddRoom, UpdateRoom, ViewAllBookings, ViewAllIssues, ResolveIssue, CreateHotel } = require('../Controller/adminController');
const authMiddleware  = require('../MiddleWare/authMiddleWare');
const isAdmin         = require('../MiddleWare/adminMiddleWare');
const upload = require('../MiddleWare/uploadMiddleWare');

// Confirm a payment manually
// PATCH /api/admin/payments/:paymentId/confirm
router.patch('/payments/:paymentId/confirm', authMiddleware, isAdmin, ConfirmPayment);

// Add a new room — with image upload
// POST /api/admin/rooms
router.post('/rooms', authMiddleware, isAdmin, upload.single('image'), AddRoom);

// Update a room
// PATCH /api/admin/rooms/:roomId
router.patch('/rooms/:roomId', authMiddleware, isAdmin, UpdateRoom);

// View all bookings
// GET /api/admin/bookings
router.get('/bookings', authMiddleware, isAdmin, ViewAllBookings);

// View all issues reported by receptionist
// GET /api/admin/issues
router.get('/issues', authMiddleware, isAdmin, ViewAllIssues);

router.post('/hotels', authMiddleware, isAdmin, CreateHotel); // adjust path/middleware to match your other admin routes

// Resolve an issue
// PATCH /api/admin/issues/:issueId/resolve
router.patch('/issues/:issueId/resolve', authMiddleware, isAdmin, ResolveIssue);

module.exports = router;