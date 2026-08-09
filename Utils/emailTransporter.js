const nodemailer = require('nodemailer');
console.log('EMAIL_SENDER:', process.env.EMAIL_SENDER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET' : 'MISSING');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
    
  }
});

const SendOtpToMail = async (email, otp) => {
  try {
    const mailDetails = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'School Portal - verify your email',
      html: `<h2>dear ${email}</h2>
       <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>please verify your email...if you are not the one please ignore</p>`
    };

    await transporter.sendMail(mailDetails);
  } catch (err) {
    console.error('Error sending OTP email:', err);
    throw err; // let the controller's catch block handle the response
  }
};

const SendTokenToMail = async (email, resetLink) => {
  try {
    const mailDetailsForToken = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'School Portal - reset your password',
      html: `<h2>dear ${email}, reset your password using these link ${resetLink}</h2>
      <p>if you are not the one please ignore</p>`
    };

    await transporter.sendMail(mailDetailsForToken);
  } catch (err) {
    console.error('Error sending reset token email:', err);
    throw err;
  }
};

module.exports = { SendOtpToMail, SendTokenToMail };