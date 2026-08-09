const {body,validationResult} = require('express-validator');

const SetQuestions =[
    body('Username')
    .notEmpty()
   .withMessage('fill in your email'),

    body('email')
    .notEmpty()
    .withMessage('fill in your email')
    .matches(/@gmail\.com$/)
    .withMessage('please write in the correct format which ends in : @gmail.com'),

     body('password')
    .notEmpty()
    .withMessage('password is required')
    .matches(/[0-9]/)
    .withMessage('password should have atleast one number')
    .matches(/[A-Z]/)
    .withMessage('password should have atleast one capital letters')
    .matches(/[a-z]/)
    .withMessage('password should have atleast one small letters')
    .matches(/[@#$%&*]/)
    .withMessage('password should have at least one of these symbols: @ # $ % & *')
];

const ValidateQuestion = async(req,res,next)=>{
    const error = validationResult(req);
    try{
        if(!error.isEmpty()){
            return res.status(400).json({
              message:'there is an error',
              data:error.array().map(err =>({
                requiredField:err.path,
                message:err.msg
            }))
        })
}
next()
}catch(error){
    return res.status(500).json({
        message:'something went wrong',
       data:error.message
    })
}
}
module.exports = {SetQuestions,ValidateQuestion};