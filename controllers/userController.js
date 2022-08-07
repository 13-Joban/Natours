const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const sendErrorResponse = (res, error, statusCode) => {
  return   res.status(statusCode).json({
        status: 'fail',
        error,
       stack:  error.stack
    })
}
const filterUnwanted = (obj, ...wanted) =>{
    const newObject = {};
    Object.keys(obj).forEach(key =>{

        if(wanted.includes(key)){
            newObject[key] = obj[key]
        }
    }
    )
  return newObject;
}
exports.getAllUsers = async (req, res) => {

    try {
        const users = await User.find();
        res.status(200).json({
            status: 'súccess',
            results: users.length,
            data: users
        })
        
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            error,
            stack: error.stack
        })
    }
    
   }
exports.updateMe = async (req, res, next)   =>{
    try {
        // 1 Give error if user trying to update password 
    if(req.body.password || req.body.confirmPassword){
        return next(new AppError('This is not a valid route for updating password please use /updateMyPassword', 400));
    }
    // 2 Filter out fields that not allowed to be updated
    const filteredObj = filterUnwanted(req.body, 'name', 'email');
    // 3 update user data

  const updatedUser =  await User.findByIdAndUpdate(req.user._id , filteredObj, {
    new: true,
    runValidators: true
  });
  
  
    res.status(200).json({
        status : 'success',
       data: {
        user: updatedUser
       }
    })
        
    } catch (error) {
       sendErrorResponse(res, error, 500);
    }
}
exports.deleteMe = async (req, res , next) => {
    try {
        // Dont delete user from db just set active status to false
     await User.findByIdAndUpdate(req.user._id, { active: false });
        
        res.status(204).json({
           status: 'success',
           data: null
        })
        
    } catch (error) {
        sendErrorResponse(res, error, 500);
    }
}
exports.createNewUser = (req, res) => {

    res.status(500)
    .json({
        message: 'this router has not been built'
    })
   }
exports.getUserbyID = (req, res) => {

    res.status(500)
    .json({
        message: 'this router has not been built'
    })
   }
exports.updateUser = (req, res) => {

    res.status(500)
    .json({
        message: 'this router has not been built'
    })
   }
exports.deleteUser = (req, res) => {

    res.status(500)
    .json({
        message: 'this router has not been built'
    })
   }
