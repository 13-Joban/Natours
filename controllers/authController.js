const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const {promisify} = require('util');
const sendEmail = require('../utils/email');
const crypto  = require('crypto');


const signToken = id =>{

        return jwt.sign({id},process.env.JWT_SECRET_KEY , {expiresIn: '10h'});
}
const createSendToken = (user, statusCode, res  ) => {
    const token = signToken(user._id);

    const cookieOptions = { 
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN  * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    user.password = undefined;
   res.cookie('jwt', token, cookieOptions);

        res.status(statusCode).json({
            status: 'success',
            token,
            data :{ user}
        })
}

exports.signup = async (req, res) => {
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            changedPasswordAt: req.body.changedPasswordAt,
            role: req.body.role,
            photo: req.body.photo
        });

        createSendToken(newUser, 201, res);
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            error
        })
    }
}
exports.login = async(req, res, next) => {
    try {
        
        // 1  check if email and password is entered
        const {email, password} = req.body;

        if( !email || !password){
            return next(new AppError('Please enter email and password', 400) );
        }
        // 2 check if user exists in database

        const userindb = await User.findOne({email}).select('+password');
        
        if(!userindb || ! await userindb.verifyPassword(password, userindb.password)){
            return next(new AppError('Email or password is incorrect', 401) );
        }
        
       
        // 3 send token to client
        createSendToken(userindb, 200, res);
        
        
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            error,
            stack: error.stack
        })
    }
}

exports.protect = async(req, res,next) => {

    try{
         // 1  check if token exists or passed in headers
         
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return next(new AppError('You are not logged in Please log in to access', 401));
    }

    // 2 Verification token

  const decoded =   await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
        // 3 If user exists
  let   currentUser = await User.findById(decoded.id);

    if(!currentUser){
       return next(new AppError('User with the given token does not exist ', 401));
    }

    // 4  Check if user has changed password or not
   
     if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User password changed please log in again', 401));
     }


    // GRANT ACCESS TO PROTECTED ROUTE
    
    req.user = currentUser
   

     next();
     
    }
   catch(error){
    res.status(404).json({
        status: error.status,
       error,
       stack: error.stack
    })
   }

}
exports.restrictTo = (...roles) => {
   return  (req, res, next) => {

    
    if(!roles.includes(req.user.role)){
        return next(new AppError('You are not allowed to access this', 403));
    }
    next();
    }
}

exports.forgotPassword = async (req, res, next) =>{
    try {
        // 1    Get user based on  email in post request

        let  user = await User.findOne({ email: req.body.email});
        if(!user){
            return next(new AppError('User not registered with email', 404));
        }

        // 2    Generate random token
   const resetToken =  user.createPasswordResetToken();
       await user.save({validateBeforeSave: false});
        // 3    Send it on user email 
      
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        const message =   `Forgot your password? Please send a PATCH request to ${resetURL} along with your new password and passwordConfirm \n. If you didn't forgot please ignore this email`;
        
        sendEmail({
            email: user.email,
            subject: 'Reset Token valid for 10 mins only',
            message: message,

        })
       res.status(200).json({
            status: 'success',
           message: 'Token sent to email'
        })
        

    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.save({validateBeforeSave: false});
        return next( new AppError('Error in sending email Please try again later', 500));
    }


}
exports.resetPassword = async (req, res, next) =>{
    try {
         // 1 Get the user based on Token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');


    const userfounded = await User.findOne({
        passwordResetToken: hashedToken,
       passwordResetExpires: {$gt : Date.now()}
    });
   

    // 2 Check if token is expired or not

    if(!userfounded){
        return next(new AppError('Token is invalid or expired'));
    }
   
    // 3 update the password and save() dont use update as save run all validators

    userfounded.password = req.body.password;
    userfounded.confirmPassword = req.body.confirmPassword;
    userfounded.passwordResetToken = undefined;
    userfounded.passwordResetExpires  = undefined;

    await userfounded.save();

    // 4 Login the user and send jwt
    createSendToken(userfounded, 200, res);
        
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            error: error,
            stack: error.stack
        })
    }

   

}
exports.updatePassword = async (req, res, next) => {
    try {
          // 1 Get user from the database
        //  currentUser taken from protected route

        const user = await User.findById(req.user._id).select('+password');
        
    // 2 Check if posted password is correct

          if( !(await user.verifyPassword(req.body.currentPassword , user.password))){
            return next(new AppError('Password is not correct', 401));
          }

          user.password = req.body.newPassword;
          
          user.confirmPassword = req.body.confirmPassword;
        await user.save();

    
    // // 4 Login and send JWT
     createSendToken(user, 200, res);
    
    
    } catch (error) {
       return next(new AppError('Error in updating password ', 500));
    }
}

