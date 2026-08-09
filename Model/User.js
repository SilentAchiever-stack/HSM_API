const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
email:{
    type:String,
    required:true,
    trim:true,
    lowerCase:true,
    unique:true
},
Username:{
    type:String,
    required:true,
    trim:true,
    lowerCase:true,
},
    otp:{
        type:String,
    },

    ExpiryOtp:{
        type:Date
    },
resetToken:{
     
        type:String,
   
},
ExpiryToken:{
        type:Date
    },
    password:{
    type:String,
    required:true,
},

 isVerified: {
 type: Boolean,
default: false 
},

role:{
type:String,
enum:['user','admin'],//a restriction rule
default:'user'
},

},{timestamps:true});

// At the bottom of Model.js/User.js

// 1. Check if the model already exists in Mongoose
/* const User = mongoose.models && mongoose.models.User 
  ? mongoose.models.User 
  : mongoose.model('User', UserSchema);

// 2. Export the safely created or existing model
module.exports = User; */

module.exports = mongoose.model('User',UserSchema)