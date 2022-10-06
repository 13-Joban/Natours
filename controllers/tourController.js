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
const multer = require('multer');
const sharp = require('sharp');



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


exports.uploadTourPhoto = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
    
])
exports.resizeTourPhoto = async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    // 1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);
  
    // 2) Images
    req.body.images = [];
  
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
  
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);
  
        req.body.images.push(filename);
      })
    );
  
    next();
    }


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
exports.getWithinTour = async (req, res, next) => {
    try {
        // /tours-within/:distance/center/:latlan/unit/:unit
    // /tours-within/250/center/457 40/unit/mi
    // console.log(req.params)
    const {distance, latlan , unit} = req.params;
    // console.log(distance, latlan, unit);
    const [lat , lan] = latlan.split(',');
    // console.log(lat, lan);
    const radius = unit === 'mi' ? distance / 3963.0 : distance / 6378.1
    if(!lat || !lan){
         next(new AppError('Please provide latitude and longitude', 400))
    }
    
    
    const tours = await Tour.find({
        startLocation:  {   $geoWithin: {$centerSphere : [[lan, lat], radius]}}
    })
    
    res.status(200).json({ 
        status: 'success',
        data: {
            tours
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
exports.getDistances =  async(req, res , next) => {
    try {
        const {latlan ,unit} = req.params;
        const [lat, lan]= latlan.split(',');
        const multiplier = unit === 'mi' ? 0.0006 : 0.001
        if(!lat || !lan){
            next(new AppError('Please provide latitude and longitude', 400))
       }

       const distances = await  Tour.aggregate([
        {
            $geoNear:  {
                near: 
               { 
                type: 'Point',
                coordinates: [lan*1, lat*1]
               },
               distanceField: 'distance',
               distanceMultiplier: multiplier
            }
        },
            {   $project: {
                name: 1, 
                distance: 1
            }
        }
        
       ])
    
       res.status(200).json({ 
        status: 'success',
        data: {
            distances
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

