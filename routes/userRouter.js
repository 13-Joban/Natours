const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController')

const router = express.Router();

router.post('/signup', authController.signup );
router.post('/login', authController.login );
router.get('/logout', authController.logout );
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
// Login middleware
router.use(authController.protect);
router.patch('/updateMyPassword',  authController.updatePassword);

router.patch('/updateMe' , userController.updateMe);
router.delete('/deleteMe' , userController.deleteMe);

router.route('/me')
.get( userController.getMe, userController.getUserbyID)

router.use(authController.restrictTo('admin'))

router
.route('/')
.get(userController.getAllUsers)
.post(userController.createNewUser)

router
.route('/:id')
.get(userController.getUserbyID)
.patch(userController.updateUser)
.delete(userController.deleteUser)



module.exports = router