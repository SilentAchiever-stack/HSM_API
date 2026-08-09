const express = require('express');
const router = express.Router();
const {createStudentIdentity,verifyOtp,Login,forgotPossword,resetPassword,logout,resendOTP } = require('../Controller/UserController')
const  authMiddleware = require('../MiddleWare/authMiddleWare');
const limiter = require('../Utils/rateLimit')
const {SetQuestions,ValidateQuestion} = require('../MiddleWare/Verification');

router.post('/register',SetQuestions,ValidateQuestion,createStudentIdentity);
router.patch('/verifyotp',limiter,verifyOtp);
router.post('/resendotp',limiter,resendOTP);
router.post('/login',limiter,Login);
router.post('/logout',limiter,authMiddleware,logout);
router.patch('/resetPassword/:token',limiter,resetPassword);
router.post('/forgotpassword',limiter,forgotPossword)

module.exports = router;