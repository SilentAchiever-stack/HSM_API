const express = require('express')
const router = express.Router();

const {createUsersDetails, userLogin} = require('../Controller/authController');
const authMiddleware = require('../MiddleWare/authMiddleWare');

router.post('/create',createUsersDetails);
router.post('/login', userLogin);
router.patch('/mustchange-password', authMiddleware, userLogin);

module.exports = router;
