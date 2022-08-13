/* eslint-disable lines-between-class-members */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-object-spread */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable prettier/prettier */
/* eslint-disable-next-line lines-between-class-members */

const Tour = require('../models/tourModel')
// const APIFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');
const factory = require('./handleFactory');


exports.aliase =  (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,difficulty,ratingsAverage,summary';
    next();
}
exports.getAllTours = factory.getAll(Tour)
exports.addNewTour   = async (req, res, next) => {
    try {
         // const newTour = new Tour({})
    // newTour.save()

    const newTour = await  Tour.create({
        name: req.body.name,
        duration: req.body.duration,
        maxGroupSize: req.body.maxGroupSize,
        difficulty: req.body.difficulty,
        price: req.body.price,
        summary: req.body.summary,
        description: req.body.description,
        imageCover: req.body.imageCover,
        images: req.body.images,
        guides: req.body.guides,
        ratingsAverage: req.body.ratingsAverage,
        ratingsQuantity: req.body.ratingsQuantity,
        price: req.body.price,
        priceDiscount: req.body.priceDiscount,
        secretTour: req.body.secretTour,
        startDates: req.body.startDates
        
    })
    
    res.status(201).json({
        status: 'success',
        data: {
           tour:  newTour
        }
    })
        
    } catch (error) {
        
        res.status(404).json({
            status: 'fail',
            error,
            stack: error.stack
        })
    }

   

    }
exports.getTourbyID = factory.getOne(Tour, {path: 'reviews'})
 
exports.updateTour  = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getTourStats = async (req, res) => {

    try {
        const stats = await  Tour.aggregate([
            {
                $match: {ratingsAverage: {$gte: 4.5} }
            },
            {
                $group: {  _id:   '$difficulty',
                    numTours:  {$sum: 1},
                    numRating: {$sum: '$ratingsQuantity'},
                    avgRating: {$avg:  '$ratingsAverage' },
                            avgPrice: {$avg: '$price'},
                            minPrice: {$min: '$price'},
                            maxPrice: {$max: '$price'}
            
            }
            },
            {
                $sort: { avgRating: -1}
            }
        ])
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            error,
            stack: error.stack
        })
    }
 
    
}
exports.getMonthlyPlan = async(req , res) => {

    try {
        const year = req.params.year*1;

    const plan = await Tour.aggregate([

        {
            $unwind: '$startDates'
        },
        {
            $match:{
                startDates:{
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group:{

                _id: {$month:   '$startDates'},
                numTourStarts: {$sum: 1},
                tours: { $push:  '$name'}
            }
        },
        {
            $addFields: { month: '$_id'}
        },
        {
            $sort:  {numTourStarts: -1}
        },+
        {
            $project: {
                _id: 0
            }
        }
        
    ])
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    })
        
    } catch (error) {
        
        res.status(404).json({
            status: 'fail',
            error,
            stack: error.stack
        })
    }

    

}
        

