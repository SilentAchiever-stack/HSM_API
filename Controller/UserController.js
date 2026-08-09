const JWT = require('jsonwebtoken');
const User = require('../Model/User');
const{SendOtpToMail,SendTokenToMail} = require('../Utils/emailTransporter');
const {Token} = require('../Utils/token');
const {generateOtp} = require('../Utils/generateOtp');
const bcrypt = require('bcrypt');
const issueToken = require('../Utils/issueToken')

const createStudentIdentity = async(req,res)=>{
    const{Username,email,password} = req.body
    try{
const newUserEmail = await User.findOne({email});

if(newUserEmail){
    return res.status(401).json({
        success:false,
        message:'this email already exist'
    })
}
const salt =await bcrypt.genSalt(10);
const mixPassword = await bcrypt.hash(password,salt);

const otp = await generateOtp();//generated
const ExpiryOtp = new Date(Date.now() + 10 * 60 *1000)

const createUserData = new User({
    password:mixPassword,
    Username,
    email,
    otp,
    ExpiryOtp,
    role:'user',
    isVerified:false
})

const savePendingData = await createUserData.save()
const userResponse = savePendingData.toObject()
delete userResponse.password
delete userResponse.otp 
delete userResponse.ExpiryOtp

await SendOtpToMail(email,otp)

return res.status(200).json({
    message:`you,${Username}, have been registered successfully,an OTP has been sent to ${email},please verify your account`,
    data:userResponse
})
    }catch(error){
        res.status(500).json({
            message:`${error}:something went wrong`
        })
    }
}
const verifyOtp = async(req,res)=>{
const {email,otp} = req.body;
try{
const verifyStudent = await User.findOne({email});
if(!verifyStudent){
    return res.status(400).json({
        message:'invalid email'
    })
}

if(verifyStudent.isVerified){
    return res.status(401).json({
message:`${email} has been verified already`
    })
}

if(verifyStudent.otp !== otp){
    return res.status(401).json({
        message:'invalid otp'
    })
}

if(verifyStudent.ExpiryOtp < new Date()){
    return res.status(401).json({
        message:'this otp is expired'
    })
}

verifyStudent.isVerified = true;
verifyStudent.otp = undefined;
verifyStudent.ExpiryOtp = undefined;

await verifyStudent.save()

const loginToken = issueToken(res,verifyStudent);

    return res.json({
    message:`${email} is now verified, logged in successfully`,
    data:loginToken
    });

}catch(error){
    return res.status(400).json({
        message:'something went wrong',
        data:error.message
    })
}
}

const resendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const student = await User.findOne({ email });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        if (student.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Account already verified'
            });
        }


       const otp = await generateOtp();
       const ExpiryOtp = new Date(Date.now() + 10 * 60 * 1000);

        student.otp = otp;
        student.ExpiryOtp = ExpiryOtp;
        await student.save();

await SendOtpToMail(email, otp);

        return res.status(200).json({
            success: true,
            message: 'New OTP sent to your email'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


const Login = async (req, res) => {
  const { Username, email, password } = req.body;
  try {
    let account = await User.findOne({ email: email.toLowerCase() });
    let isAdminAccount = false;

    if (!account) {
      account = await Admin.findOne({ email: email.toLowerCase() });
      isAdminAccount = true;
    }

    if (!account) {
      return res.status(400).json({ message: 'this email does not exist' });
    }

    if (!isAdminAccount && !account.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    if (account.Username !== Username.toLowerCase()) {
      return res.status(400).json({ message: 'invalid Username' });
    }

    const doesPasswordMatch = await bcrypt.compare(password, account.password);
    if (!doesPasswordMatch) {
      return res.status(401).json({ message: 'invalid password' });
    }

    const loginToken = issueToken(res, account);
    return res.json({
      message: 'logged in successfully',
      data: loginToken
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', data: error.message });
  }
};

const forgotPossword = async(req,res)=>{
    const {email} = req.body
    try{
        const confrimEmail = await User.findOne({email:email.toLowerCase()})
        if(!confrimEmail ){
            return res.status(400).json({
                message: 'invalid Email or Account'
            });
        }

        const token = Token();
        const Expirytoken = new Date(Date.now() + 15 * 60 * 1000);
        confrimEmail.resetToken = token;
        confrimEmail.ExpiryToken = Expirytoken;

        await confrimEmail.save()

        const resetLink = `http://localhost:3000/reset-password/${token}`
        await SendTokenToMail(email,resetLink);

        return res.status(200).json({
            message:`dear ${email}, a resetlink has been sent to you to reset your password`
        })

    }catch(error){
                res.status(500).json({success:false,message:'Internal server error'});
            }

}

const resetPassword = async(req,res)=>{
    const{password} = req.body;
    const {token} = req.params
try{
    const confirmToken = await User.findOne({resetToken:token});//resetToken = the one sitting in our database (the field/column on the student's record)
//token = the one sitting in the URL (pulled from req.params, i.e. what the user clicked)
    
    if (!confirmToken) {
      return res.status(401).json({ message: 'invalid or expired token' });
    }

    if (confirmToken.ExpiryToken < Date.now()) {
      return res.status(401).json({ message: 'invalid or expired token' });
    }

const salt = await bcrypt.genSalt(10);
const mixPassword = await bcrypt.hash(password,salt);

confirmToken.password = mixPassword 
confirmToken.resetToken = undefined;
confirmToken.ExpiryToken= undefined;

 await confirmToken.save()

 return res.status(200).json({
    message:'password reset successfully'
})

}catch(error){
                res.status(500).json({success:false,message:'Internal server error'});
            }
}


const logout = async(req,res)=>{
    try {
        res.clearCookie('access', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        return res.status(200).json({
            message: 'logout successfully'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'something went wrong',
            error: error.message
        });
    }
}
module.exports = {createStudentIdentity,verifyOtp,Login,forgotPossword,resetPassword,logout,resendOTP }