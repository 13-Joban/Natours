/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
 /* eslint-disable-next-line prettier/prettier */

const mongoose = require('mongoose');
const slugify = require('slugify');
const { Schema } = mongoose;
const validator= require('validator');
const User = require('./userModel')
const tourSchema = new Schema({

    name: {
        type: String,
        required: [true, 'Tour name is required'],
        unique: true,
        trim: true,
        maxLength: [40, 'A Tour name must have less than or 40 characters'],
        minLength: [10, 'A Tour name must have more than 10 characters']
        // validate:{
        //     validator: function(str){
        //         return validator.isAlpha(str.split(' ').join(''));
        //     },
        //     message: 'Tour name should only contain  letters'
        // }
               
        
    },
    slug: String
    , 
    secretTour:{
        type: Boolean,
        default: false
    },
     rating: {
         type: Number,
         default: 4.5,
         min: [1.0, 'Minimum Rating should be 1.0'],
         max: [5.0, 'Maximum Rating should be 5.0']

     }
     ,
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    
    ratingsQuantity: {
        type: Number,
        default: 0
    },
  price: {
        type: Number,
        required: [true, 'Tour price is required']
    },
    priceDiscount: {
       type:  Number,
       validate:{
        validator: function(val){
            return val < this.price  // 100 < 200 -good 200<100 -bad (discount can't be greater)
           },
           message: 'Discount price ({VALUE}) should be less than price'
       } 
    },
    duration:{
        
        type: Number,
        required: [true, 'Tour duration is required']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Tour maxGroup is required']
    }, 
    summary: {
        type : String,
        trim: true,
        required: [true, 'Tour description is required']
    },
    description: {
        type: String,
       trim: true
    },
    imageCover:{
        type: String,
        required: [true, 'Tour imageCover is required']
    },

    difficulty: {
        type: String,
        required: [true, 'Tour difficulty is required'],
        enum: {
         values: ['easy', 'medium', 'difficult'],
         message: 'Difficulty must be easy, medium, or difficult'
        }
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
       
       
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
    
            },
            coordinates: [Number],
           address: String,
            day: Number,
            description: String
        }
    ],
    guides: []

},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
}
)

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;

})

// DOCUMENT  MIDDLEWARE -- RUNS BEFORE .save() and .create() method

// tourSchema.pre('save', function(next){
//      this.slug = slugify(this.name, {lower: true});
//     next();
// })
// tourSchema.pre('save', function(next){
//     // console.log('will save document .........');
//     next();
// })
// tourSchema.post('save', function(doc, next){


//     // console.log(doc);
//     // console.log('saved');
//     next();
    
// })
tourSchema.post('save', async function(next){
    const guidesPromise  = this.guides.map( async id => await User.findById(id));
     this.guides = await Promise.all(guidesPromise);
    next()
})
// OUERY MIDDLEWARE RUNS --> RUNS BEFORE FIND METHOD
// tourSchema.pre(/^find/, function(next){
//     this.find({secretTour: {$ne: true}});
//     this.startTime=  Date.now()
//     next();
// })
// tourSchema.post(/^find/, function(docs, next){
//     // console.log(`Query took ${Date.now() - this.startTime} milliseconds`);
//     // console.log(docs);
//     next();
// })

// tourSchema.pre('findOne', function(next){
//     this.find({secretTour: {$ne: true}})
//     next();
// })

// tourSchema.pre('aggregate', function(next){
//     this.pipeline().unshift({
//         $match: { secretTour: { $ne: true}} 
//     })
//     // console.log(this.pipeline());
    
//     next()
// })
const Tour =  mongoose.model('Tour', tourSchema);

module.exports = Tour;







