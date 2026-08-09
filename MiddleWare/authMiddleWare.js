const JWT = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 1. Guard check: Is the token actually present, and is it a string?
    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ 
            success: false, 
            message: 'Access denied. Valid authentication token missing.' 
        });
    }

    // 2. Guard check: Does it look like a real JWT structure (3 parts separated by dots)?
    if (token.split('.').length !== 3) {
        console.log("MALFORMED TOKEN BLOCKED:", token);
        return res.status(400).json({ 
            success: false, 
            message: 'Access denied. The provided authentication token is malformed.' 
        });
    }

    try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } //differentiate between expired and invalid
catch (err) {
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
            success: false, 
            message: 'Token has expired. Please login again.' 
        });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid token.' 
        });
    }
    return res.status(403).json({ success: false, message: 'Not authorized' });
}
};

module.exports = authMiddleware;

/* Step 1 — Import JWT
javascriptconst JWT = require('jsonwebtoken');
Brings in the library that can sign and verify tokens.

Step 2 — Get the token from the request header
javascriptconst authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];
The frontend sends the token in the request header like this:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

authHeader = "Bearer eyJhbGci..."
authHeader.split(' ') = ["Bearer", "eyJhbGci..."]
[1] = "eyJhbGci..." — just the token part
&& means if authHeader is empty, don't even try to split it


Step 3 — Check token exists
javascriptif (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ message: 'Access denied. Valid authentication token missing.' });
}
Three checks here:

!token — no token at all
=== 'null' — frontend accidentally sent the string "null"
=== 'undefined' — frontend accidentally sent the string "undefined"

All three mean the same thing — no valid token was sent.

Step 4 — Check token structure
javascriptif (token.split('.').length !== 3) {
    return res.status(400).json({ message: 'Token is malformed.' });
}
A real JWT always looks like:
header.payload.signature
Splitting by . should always give exactly 3 parts. If not, someone sent a fake or broken token — block it before even trying to verify.

Step 5 — Verify the token
javascripttry {
    const decoded = JWT.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
}

JWT.verify checks the token is genuine and not expired
If valid, it decodes the payload back into an object:

javascriptdecoded = {
    id: 1,
    username: "john_doe",
    email: "john@example.com",
    role: "admin"
}

req.user = decoded — attaches it to the request so every middleware after can access it
next() — moves to the next middleware or controller


Step 6 — Catch errors
javascriptcatch (err) {
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired. Please login again.' });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token.' });
    }
    return res.status(403).json({ message: 'Not authorized' });
}
Two specific JWT errors:

TokenExpiredError — token is genuine but the 1h has passed → tell frontend to login again
JsonWebTokenError — token is tampered or fake → block it
Anything else → general 403 not authorized


The Full Flow
Request comes in
    → extract token from header
    → token missing?        → 401 stop
    → token malformed?      → 400 stop
    → JWT.verify runs
        → expired?          → 401 stop
        → fake/tampered?    → 401 stop
        → valid?            → attach to req.user → next()
    → next middleware runs with req.user available */