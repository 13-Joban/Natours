// review / rating / createdAt / tour ref / user ref

const mongoose = require('mongoose');
const User = require('../models/userModel');
const Tour = require('../models/tourModel');

const reviewSchema = new mongoose.Schema({
    review:{
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: [1.0, 'Minimum rating must be 1.0'],
        max: [5.0, 'Maximum rating must be 5.0'],
        default: 4.5
    },
    createdAt: {
        type: Date,
        default: Date.now()
      }
      ,
      user:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
          }
       ,
      tour:
      
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tour',
            required: true
        }
      
      
},
{ 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)
reviewSchema.pre(/^find/, function(next){
    this.populate({ 
        path: 'tour',
        select: 'name'
    }).populate({
        path: 'user',
        select: '-role -__v '
    })
    next();
})
// calculating average rating for tour make it static for using multiple times
reviewSchema.statics.calcAverageRatings = async function(tourId){

  const stats = await this.aggregate([
        {
            $match: {
                tour: tourId
            }
        },
        {
            $group: {  
                _id: '$tour',
                nRating: { $sum: 1},
                avgRating: { $avg: '$rating'}
            }
        }
    ])
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
          ratingsQuantity: stats[0].nRating,
          ratingsAverage: stats[0].avgRating
        });
      } else {
        await Tour.findByIdAndUpdate(tourId, {
          ratingsQuantity: 0,
          ratingsAverage: 4.5
        });
      }
}

reviewSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.tour);

})

// findByIdAndUpdate  --> findOne and update
// findByIdAndDelete --> findOne and delete
reviewSchema.pre(/^findOneAnd/, async function(next){
  // this --> query of findOne
  // execute query --> review
  this.revi = await  this.findOne().clone();
  
  next();
  
})
reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); does NOT work here, query has already executed
    await this.revi.constructor.calcAverageRatings(this.revi.tour);
  });

  
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;