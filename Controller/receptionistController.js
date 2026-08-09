const Booking = require('../Model/Booking');
const Payment = require('../Model/Payment');
const User = require('../Model/User');
const Issue = require('../Model/Issue');

// =============================================
// 1. CONFIRM BOOKING (check if payment is made)
// =============================================
// GET /api/receptionist/bookings/:bookingId/confirm
const ConfirmBooking = async (req, res) => {
    const bookingId = req.params.bookingId;

    try {
        const booking = await Booking.findById(bookingId)
            .populate('user')
            .populate({ path: 'room', populate: { path: 'hotel' } });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const payment = await Payment.findOne({ booking: bookingId });

        // check if payment has been made
        if (!payment || payment.status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment not confirmed. Cannot check in guest.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Payment confirmed. Guest can be checked in.',
            data: {
                guest: booking.user.username,
                room: booking.room.room_number,
                hotel: booking.room.hotel.name,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                payment: payment.status
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =============================================
// 2. SEARCH GUEST BY USERNAME
// =============================================
// GET /api/receptionist/guests/:username
const SearchGuestByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        const guest = await User.findOne({ username }).select('-password');

        if (!guest) {
            return res.status(404).json({
                success: false,
                message: 'Guest not found'
            });
        }

        const bookings = await Booking.find({ user: guest._id })
            .populate({ path: 'room', populate: { path: 'hotel' } })
            .sort({ createdAt: -1 });

        const bookingsWithPayment = await Promise.all(
            bookings.map(async (booking) => {
                const payment = await Payment.findOne({ booking: booking._id });
                return { ...booking.toObject(), payment: payment || null };
            })
        );

        return res.status(200).json({
            success: true,
            data: { ...guest.toObject(), bookings: bookingsWithPayment }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =============================================
// 3. MARK GUEST AS CHECKED IN
// =============================================
// PATCH /api/receptionist/bookings/:bookingId/checkin
const MarkGuestCheckedIn = async (req, res) => {
    const bookingId = req.params.bookingId;

    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const payment = await Payment.findOne({ booking: bookingId });

        // only allow check in if payment is confirmed
        if (!payment || payment.status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Cannot check in. Payment not confirmed.'
            });
        }

        if (booking.status === 'checked_in') {
            return res.status(400).json({
                success: false,
                message: 'Guest is already checked in'
            });
        }

        // update booking status to checked_in
        const updated = await Booking.findByIdAndUpdate(
            bookingId,
            { status: 'checked_in' },
            { new: true }
        ).populate('user').populate({ path: 'room', populate: { path: 'hotel' } });

        return res.status(200).json({
            success: true,
            message: `${updated.user.username} has been checked in to room ${updated.room.room_number}`,
            data: updated
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =============================================
// 4. REPORT AN ISSUE TO ADMIN
// =============================================
// POST /api/receptionist/issues
// Body: { title, description, roomId (optional) }
const ReportIssue = async (req, res) => {
    const receptionistId = req.user.id;
    const { title, description, roomId } = req.body;

    if (!title || !description) {
        return res.status(400).json({
            success: false,
            message: 'Title and description are required'
        });
    }

    try {
        const issue = await Issue.create({
            title,
            description,
            reportedBy: receptionistId,
            room: roomId || null,
            status: 'open'
        });

        return res.status(201).json({
            success: true,
            message: 'Issue reported to admin successfully',
            data: issue
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { ConfirmBooking, SearchGuestByUsername, MarkGuestCheckedIn, ReportIssue };
