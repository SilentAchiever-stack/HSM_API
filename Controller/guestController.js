const Room = require('../Model/Room');
const Booking = require('../Model/Booking');
const Payment = require('../Model/Payment');

// 1. SEARCH AVAILABLE ROOMS
// GET /api/guest/rooms/search?checkIn=2026-07-01&checkOut=2026-07-05&type=suite
const SearchRooms = async (req, res) => {
    const { checkIn, checkOut, type } = req.query;

    if (!checkIn || !checkOut) {
        return res.status(400).json({
            success: false,
            message: 'checkIn and checkOut dates are required'
        });
    }

    try {
        const filter = { status: 'available' };
        if (type) {
            filter.type = { $regex: type, $options: 'i' };
        }

        let rooms = await Room.find(filter).populate('hotel');

        // exclude rooms that already have overlapping bookings
        const overlappingBookings = await Booking.find({
            checkIn: { $lte: new Date(checkOut) },
            checkOut: { $gte: new Date(checkIn) }
        }).select('room');

        const bookedRoomIds = overlappingBookings.map(b => b.room.toString());
        rooms = rooms.filter(room => !bookedRoomIds.includes(room._id.toString()));

        if (rooms.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No available rooms found for these dates'
            });
        }

        return res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =============================================
// 2. BOOK A ROOM
// =============================================
// POST /api/guest/bookings
// Body: { roomId, checkIn, checkOut }
const BookRoom = async (req, res) => {
    // userId comes from the JWT token — guest must be logged in
    const userId = req.user.id;
    const { roomId, checkIn, checkOut } = req.body;

    if (!roomId || !checkIn || !checkOut) {
        return res.status(400).json({
            success: false,
            message: 'roomId, checkIn and checkOut are required'
        });
    }

    try {
        // Step 1 — check if room exists and is available
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        if (room.status !== 'available') {
            return res.status(400).json({
                success: false,
                message: 'Room is not available'
            });
        }

        // Step 2 — check if room is already booked for those dates
        const overlappingBooking = await Booking.findOne({
            room: roomId,
            checkIn: { $lte: new Date(checkOut) },
            checkOut: { $gte: new Date(checkIn) }
        });

        if (overlappingBooking) {
            return res.status(400).json({
                success: false,
                message: 'Room is already booked for these dates'
            });
        }

        // Step 3 — calculate total price
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        if (days <= 0) {
            return res.status(400).json({
                success: false,
                message: 'checkOut must be after checkIn'
            });
        }

        const totalPrice = room.price * days;

        // Step 4 — create the booking
        let booking = await Booking.create({
            user: userId,
            room: roomId,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            totalPrice,
            status: 'pending'
        });

        booking = await Booking.findById(booking._id).populate({
            path: 'room',
            populate: { path: 'hotel' }
        });

        // Step 5 — mark room as booked
        await Room.findByIdAndUpdate(roomId, { status: 'booked' });

        return res.status(201).json({
            success: true,
            message: `Room booked successfully for ${days} night(s)`,
            data: booking
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =============================================
// 3. MAKE PAYMENT
// =============================================
// POST /api/guest/bookings/:bookingId/pay
const MakePayment = async (req, res) => {
    const userId = req.user.id;
    const bookingId = req.params.bookingId;

    try {
        // Step 1 — find the booking and make sure it belongs to this guest
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // make sure the booking belongs to the logged in guest
        if (booking.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to pay for this booking'
            });
        }

        // Step 2 — check if already paid
        const existingPayment = await Payment.findOne({ booking: bookingId });
        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: 'Payment already made for this booking'
            });
        }

        // Step 3 — create payment record
        const payment = await Payment.create({
            booking: bookingId,
            amount: booking.totalPrice,
            status: 'paid',
            paidAt: new Date()
        });

        // Step 4 — update booking status to confirmed
        await Booking.findByIdAndUpdate(bookingId, { status: 'confirmed' });

        return res.status(201).json({
            success: true,
            message: 'Payment successful. Your booking is now confirmed!',
            data: payment
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =============================================
// 4. VIEW MY BOOKING DETAILS
// =============================================
// GET /api/guest/bookings
const ViewMyBookings = async (req, res) => {
    const userId = req.user.id;

    try {
        const bookings = await Booking.find({ user: userId })
            .populate({ path: 'room', populate: { path: 'hotel' } })
            .sort({ createdAt: -1 });

        // attach payment info to each booking (payment is a separate collection)
        const bookingsWithPayment = await Promise.all(
            bookings.map(async (booking) => {
                const payment = await Payment.findOne({ booking: booking._id });
                return { ...booking.toObject(), payment: payment || null };
            })
        );

        if (bookingsWithPayment.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'You have no bookings yet'
            });
        }

        return res.status(200).json({
            success: true,
            count: bookingsWithPayment.length,
            data: bookingsWithPayment
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =============================================
// 5. VIEW SINGLE BOOKING DETAIL
// =============================================
// GET /api/guest/bookings/:bookingId
const ViewSingleBooking = async (req, res) => {
    const userId = req.user.id;
    const bookingId = req.params.bookingId;

    try {
        const booking = await Booking.findById(bookingId)
            .populate({ path: 'room', populate: { path: 'hotel' } });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // make sure the booking belongs to the logged in guest
        if (booking.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this booking'
            });
        }

        const payment = await Payment.findOne({ booking: booking._id });

        return res.status(200).json({
            success: true,
            data: { ...booking.toObject(), payment: payment || null }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { SearchRooms, BookRoom, MakePayment, ViewMyBookings, ViewSingleBooking };
