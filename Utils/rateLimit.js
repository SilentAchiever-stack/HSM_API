const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
    windowMs : 15*60*1000,
    limit: 10,
    standardHeaders:'draft-8',
    legacyHeaders:false,
    ipv6Subnet:56,
     message: {
        success: false,
        message: 'Too many attempts, please try again after 15 minutes'
    }
})

module.exports = limiter