const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide your email']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minLength: 8,
        select: false
    },
   confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // Runs on save
            validator: function(el){
                return el === this.password;
            },
            message: 'Passwords are not matched'
        }
    },
    role:{
        type:String,
        enum:['user', 'admin', 'guide', 'lead-guide'],
        default: 'user'
    },
    photo: String,
    changedPasswordAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: 'boolean',
        default: true,
        select: false
    }
})

userSchema.pre('save' , async function(next){
    // Only runs when password is modified
    if(!this.isModified('password'))  return next();

    // hash the password for storing in db
    this.password =  await bcrypt.hash(this.password, 8);

    // delete the confirm password as we don't want to store it

    this.confirmPassword = undefined;
    next();

})
userSchema.pre('save', function(next){
    // if password is not changed or new document 
    if(!this.isModified('password') || this.isNew) return next();

    this.changedPasswordAt= Date.now()  - 2000;
    next();

})
userSchema.pre(/^find/, function(next){

     this.find( {active : { $ne: false }})
    next();
})

userSchema.methods.verifyPassword = async (candidatePassword, userPassword) => {
    try {
        return  await  bcrypt.compare(candidatePassword, userPassword);
        
    } catch (error) {
        return new AppError('passwords dont matched', 401);
    }
   
}
userSchema.methods.changedPasswordAfter =  function(JWTTimeStamp){


    if(this.changedPasswordAt){
        let ChangedDate = this.changedPasswordAt.getTime();
        ChangedDate = parseInt(ChangedDate/1000, 10);
        
        return JWTTimeStamp  < ChangedDate;
      }
      
      return false;
}
userSchema.methods.createPasswordResetToken = function(){

    const resetToken = crypto.randomBytes(32).toString('hex');
    
   this.passwordResetToken =  crypto.createHash('sha256').update(resetToken).digest('hex');
   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
   

  return resetToken;
}
const User = mongoose.model('User', userSchema );
module.exports = User;
