const JWT = require('jsonwebtoken');

const issueToken = (res, student) => {
    const payload = {
        userId: student._id,
        faculty: student.faculty,
        department: student.department,
        matric: student.matric,
        role: student.role
    }

    const token = JWT.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '7h' });

    res.cookie('access', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 60 * 60 * 1000
    });

    return token;
}

module.exports = issueToken;