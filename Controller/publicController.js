const Room = require('../Model/Room');
const Hotel = require('../Model/Hotel');
const Booking = require('../Model/Booking');

const BrowseRooms = async (req, res) => {
    const { checkIn, checkOut, type } = req.query;

    try {
        const filter = { status: 'available' };

        if (type) {
            filter.type = { $regex: type, $options: 'i' };
        }

        let rooms = await Room.find(filter).populate('hotel').sort({ price: 1 });

        // exclude rooms with overlapping bookings for the given dates
        if (checkIn && checkOut) {
            const overlappingBookings = await Booking.find({
                checkIn: { $lte: new Date(checkOut) },
                checkOut: { $gte: new Date(checkIn) }
            }).select('room');

            const bookedRoomIds = overlappingBookings.map(b => b.room.toString());
            rooms = rooms.filter(room => !bookedRoomIds.includes(room._id.toString()));
        }

        return res.status(200).json({ success: true, count: rooms.length, data: rooms });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const ViewHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find().select('_id name address description');
        return res.status(200).json({ success: true, data: hotels });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { BrowseRooms, ViewHotels };
