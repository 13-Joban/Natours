const Review = require('../models/reviewsModel');
const factory = require('./handleFactory');

// create and getall reviews
const createReview = async (req, res) => {
    try {
        if(!req.body.tour) req.body.tour = req.params.tourId
         req.body.user = req.user._id;
        

        const newReview = await  Review.create(req.body);
        res.status(201).json({
            status: 'success',
            data : {
                review: newReview
            }
        })   
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            error: error,
            stack: error.stack
        })
    }
}
const getAllReviews = factory.getAll(Review);
const updateReview = factory.updateOne(Review);
const deleteReview = factory.deleteOne(Review);
const getReviewById = factory.getOne(Review);

module.exports = {
    createReview, getAllReviews, deleteReview, updateReview, getReviewById
}