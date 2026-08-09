const User = require('../Model/User');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

const createUsersDetails = async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email) {
        return res.status(400).json({ message: "Username and email are required." });
    }

    try {
        const ExistingUsername = await User.findOne({ username });

        if (ExistingUsername) {
            return res.status(400).json({ message: "Username already exists." });
        }

        const salt = await bcrypt.genSalt(11);
        const hashPassword = await bcrypt.hash(password, salt);

        const details = await User.create({
            username,
            email,
            password: hashPassword,
            role: role || "guest"
        });

        console.log('Details saved successfully');
        const payload = {
            id: details._id,
            username: details.username,
            email: details.email,
            role: details.role
        }
        const token = JWT.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { id: details._id, username: details.username, email: details.email },
            token
        });

    } catch (err) {
        console.log('Error encountered:', err);

        // Mongoose's duplicate key error (equivalent to Prisma's P2002)
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || 'field';
            return res.status(400).json({
                success: false,
                message: `${field} already exists. Please use a different ${field}.`
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Something went wrong on the server'
        });
    }
}

const userLogin = async (req, res) => {
    console.log('Login request received:', req.body);
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid username or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'invalid Password or username'
            });
        }
        const payload = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
        const token = JWT.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        if (user.mustChangePassword) {
            return res.status(200).json({
                success: true,
                mustChangePassword: true,
                role: user.role,
                message: 'Logged in successfully, but you must change your default password before proceeding.',
                token
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            role: user.role,
            token
        });
    }
    catch (err) {
        console.error('Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong on the server'
        });
    }
}
module.exports = { createUsersDetails, userLogin };
