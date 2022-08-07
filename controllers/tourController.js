/* eslint-disable lines-between-class-members */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-object-spread */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable prettier/prettier */
/* eslint-disable-next-line lines-between-class-members */

const Tour = require('../models/tourModel')
const APIFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');
// const alltours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
//     )

// exports.checkBody = (req, resp, next) => {
//     if(!req.body.name || !req.body.price){
//         resp.status(400)
//         .json({
//             status: 'fail', 
//             message: 'Cant add new tour without price and name'
//         })
//     }
//     next()
// }    
exports.aliase =  (req, resp, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,difficulty,ratingsAverage,summary';
    next();
}




exports.getAllTours = async ( req, resp, next) => {

       
    try {
        const features = new APIFeatures(Tour.find(), req.query )
        .filter()
        .sort()
        .limiting()
        .paginate();
        // execute query object
        const tours =  await features.query;
        
       

        // Send response

  resp.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        })
    } catch (error) {
        resp.status(404).json({
            status: 'fail',
       error,
       stack: error.stack
        })
    }
    
    }
exports.addNewTour   = async (req, resp, next) => {
    try {
         // const newTour = new Tour({})
    // newTour.save()

    const newTour =   await  Tour.create(req.body, {
        new: true
    })
    console.log(newTour)
    resp.status(201).json({
        status: 'success',
        data: {
           tour:  newTour
        }
    })
        
    } catch (error) {
        
        resp.status(404).json({
            status: 'fail',
            error,
            stack: error.stack
        })
    }

   

    }
exports.getTourbyID = async (req, resp, next) => {
        // const desiredid = req.params.id;
    
        // // desired id is a string change it into number
        // const desiredidnum =  desiredid*1;
    
        // const desiredtour  = alltours.find(ele => ele.id === desiredidnum)
        // //console.log(desiredidnum)
        // // console.log(desiredtour)
    
        // if(!desiredtour){
        //   return   resp
        //     .status(404)
        //     .json({
        //         name: 'fail',
        //         message: 'Invalid ID'
        //     })
        // }
    
        // resp
        // .status(200)
        // .json({
        //     name: 'success',
        //     data:{
        //         tour: desiredtour
        //     }
        // })
    
        try{
            const tour = await Tour.findOne({ _id: req.params.id}) 
        // findbYiD = find({_id: req.params.id})
        if(!tour){
            return  next(new AppError('No tour founded with the given id' , 404));
           }

        resp.status(200).json({
            status: 'success',
            data: {
                tour
            } 
        })
        }
        catch(error){
            resp.status(404).json({
                status: 'fail',
                error,
                stack: error.stack
            })
        }
        

    }
exports.updateTour  =  async (req, resp, next) => {
        // const desiredid = req.params.id;
    
        // // desired id is a string change it into number
        // const desiredidnum =  desiredid*1;
    
        // const   desiredtour  = alltours.find(ele => ele.id === desiredidnum)
        // //console.log(desiredidnum)
        // // console.log(desiredtour)
    
        // if(!desiredtour){
        //     return   resp
        //     .status(404)
        //     .json({
        //         name: 'fail',
        //         message: 'Invalid ID'
        //     })
        
//    const updatedtour = {...desiredtour, ...req.body}
    
//         const updatedtoursarr = alltours.map(t => 
//            t.id === updatedtour.id ? updatedtour : t
//                 )
    
//         fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(updatedtoursarr), err => {
    
//             resp
//             .status(200)
//             .json({
//                 name: 'success',
//                 data: {
//                     tour: updatedtour
//                 }
//             })
//         })

   try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }
    )

    resp.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
}
catch(error){
    resp.status(404).json({
        status: 'fail',
       error,
       stack: error.stack
    })
}

       
    
    }
exports.deleteTour =  async (req, resp, next) =>{
    
    //    const desiredid = req.params.id;
   
    //    // desired id is a string change it into number
    //    const desiredidnum =  desiredid*1;
   
    //    const   desiredtour  = alltours.find(ele => ele.id === desiredidnum)
       //console.log(desiredidnum)
       // console.log(desiredtour)
   
    //    if(!desiredtour){
    //     return   resp
    //        .status(404)
    //        .json({
    //            name: 'fail',
    //            message: 'Invalid ID'
    //        })
    //    }
       
    //    const updatedtoursarr = alltours.filter( tour => tour.id !== desiredtour.id)
   
    //     fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(updatedtoursarr), err => {
   
    //        resp
    //        .status(204)
    //        .json({
    //            name: 'success',
    //            data:null
    //        })
    //    })

    try{
      const tour =   await Tour.findByIdAndDelete(req.params.id)

      if(!tour){
       return  next(new AppError('No tour deleted with the given id', 404) );
      }

    resp.status(204).json({
        status: 'success',
        data: null
    })
    }
    catch(error){

        resp.status(404).json({
            status: 'fail',
            error,
            stack: error.stack
        })
    }
    

}
   
exports.getTourStats = async (req, res) =>{

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
        

