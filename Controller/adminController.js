const Payment = require('../Model/Payment');
const Booking = require('../Model/Booking');
const Room = require('../Model/Room');
const Issue = require('../Model/Issue');
const Hotel = require('../Model/Hotel');
const { uploadFile } = require('../Cloudinaryhelper/helper');
const fs = require('fs');


const ConfirmPayment = async (req, res) => {
    const paymentId = req.params.paymentId;

    try {
        const payment = await Payment.findById(paymentId).populate('booking');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment is already confirmed'
            });
        }

        // update payment to paid
        const updated = await Payment.findByIdAndUpdate(
            paymentId,
            { status: 'paid' },
            { new: true }
        );

        // update booking to confirmed
        await Booking.findByIdAndUpdate(payment.booking._id, { status: 'confirmed' });

        return res.status(200).json({
            success: true,
            message: 'Payment confirmed successfully',
            data: updated
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const AddRoom = async (req, res) => {
    const { hotelId, room_number, type, price } = req.body;

    if (!hotelId || !room_number || !type || !price) {
        return res.status(400).json({
            success: false,
            message: 'hotelId, room_number, type and price are all required'
        });
    }

    try {
        let imageUrl = null;

        if (req.file) {
            const { URL } = await uploadFile(req.file.path);
            fs.unlinkSync(req.file.path);
            imageUrl = URL;
        }

        let room = await Room.create({
            hotel: hotelId,
            room_number,
            type,
            price: parseFloat(price),
            imageUrl,
            status: 'available'
        });

        room = await Room.findById(room._id).populate('hotel');

        return res.status(201).json({
            success: true,
            message: 'Room added successfully',
            data: room
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const UpdateRoom = async (req, res) => {
    const roomId = req.params.roomId;
    const { room_number, type, price, status } = req.body;

    try {
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        const updates = {};
        if (room_number) updates.room_number = room_number;
        if (type) updates.type = type;
        if (price) updates.price = price;
        if (status) updates.status = status;

        const updated = await Room.findByIdAndUpdate(roomId, updates, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Room updated successfully',
            data: updated
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const ViewAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user')
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



const ViewAllIssues = async (req, res) => {
    try {
        const issues = await Issue.find()
            .populate('reportedBy')
            .populate('room')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: issues.length,
            data: issues
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



const ResolveIssue = async (req, res) => {
    const issueId = req.params.issueId;

    try {
        const issue = await Issue.findById(issueId);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        const updated = await Issue.findByIdAndUpdate(
            issueId,
            { status: 'resolved' },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Issue resolved successfully',
            data: updated
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const CreateHotel = async (req, res) => {
    const { name, address, description } = req.body;

    if (!name || !address) {
        return res.status(400).json({
            success: false,
            message: 'name and address are required'
        });
    }

    try {
        const hotel = await Hotel.create({ name, address, description });

        return res.status(201).json({
            success: true,
            message: 'Hotel created successfully',
            data: hotel
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { ConfirmPayment, AddRoom, UpdateRoom, ViewAllBookings, ViewAllIssues, ResolveIssue, CreateHotel };
