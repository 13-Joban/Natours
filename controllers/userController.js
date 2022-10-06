const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const factory = require('./handleFactory');
const multer = require('multer');
const sharp = require('sharp');



// storing the uploaded images in disk 
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const extension = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${extension}` )
//     }
// })

// storing images in memory we can get it through buffer objs
const multerStorage = multer.memoryStorage();

// filter for check if it is image or not

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true);
    }
    else{
        cb(new AppError('Not an image ! Please upload a image', 404), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})
exports.resizeUserPhoto = async (req, res, next) => {
    if(!req.file) return next();

    // console.log(req.file)
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

   const r =   await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({quality: 90 }).toFile(`public/img/users/${req.file.filename}`)

    next();

}

exports.uploadUserPhoto = upload.single('photo')


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
exports.getAllUsers = factory.getAll(User);

exports.updateMe = async (req, res, next)   =>{
    try {
        // 1 Give error if user trying to update password 
    if(req.body.password || req.body.confirmPassword){
        return next(new AppError('This is not a valid route for updating password please use /updateMyPassword', 400));
    }
    // console.log(req.user);
    // 2 Filter out fields that not allowed to be updated
    const filteredBody = filterUnwanted(req.body, 'name', 'email');
    // 3 update user data
    if(req.file){
        filteredBody.photo = req.file.filename;

    }

  const updatedUser =  await User.findByIdAndUpdate(req.user._id , filteredBody, {
    new: true,
    runValidators: true
  });
  
//   console.log(updatedUser);
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
exports.getMe = async (req, res , next)   => {
    req.params.id = req.user.id;
    next();
}

//  Dont update password here
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getUserbyID = factory.getOne(User);
