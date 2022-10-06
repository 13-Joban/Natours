const Tour = require('../models/tourModel');
const AppError = require('../utils/AppError');
const  User = require('../models/userModel');
const Booking = require('../models/bookingModel');

exports.getOverview =  async (req, res) => {
  try{
// 1 Get Tours from collection
const tours = await Tour.find();
// 2 Build Template
// 3 Render that template using data from 1)

res.status(200).render('overview',{
  title: 'All Tours',
  tours
})
  }
catch(error){
      res.status(500).send('error');
    }
}
exports.getTour = async (req, res, next) => {
  try{
// 1 Get the  data for requested tour (including reviews and guides)
    // console.log(req.params.slug)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({ 
      path: 'reviews',
      fields: 'review rating user'
  }).populate(
    'guides' )

    if(!tour){
      return next(new AppError('There is no tour with given name', 404) );
    }
  // 2 Build Template
  // 3 Render that template using data from 1)
  res.status(200).render('tour',{
     title: tour.name, 
     tour
  })
  }
  catch(error){
    res.status(500).send('error');
  }
    
  }
exports.getMyTours = async (req, res, next) => {

   //1) Find all bookings
  const bookings = await Booking.find({
    user: req.user.id
  });
 
  //2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
 
  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
  
 
}
exports.getLoginForm = (req, res) => {
 
    res.status(200).render('login', {
      title: 'Login'
      
    })
}
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account'
    
  })
}
exports.updateUserData = async (req, res, next) => {
  try{
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        new: true,
        runValidators: true
      }
    );
  
    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser
    });
  }
  catch(error){
    res.status(500).send('error');
  }
}
  