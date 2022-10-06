const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/APIFeatures')
exports.deleteOne = Model => async (req, res, next) =>{

    try{
      const doc =  await Model.findByIdAndDelete(req.params.id)

      if(!doc){
       return  next(new AppError('No document deleted with the given id', 404) );
      }

    res.status(204).json({
        status: 'success',
        data: null
    })
    }
    catch(error){

        res.status(404).json({
            status: 'fail',
            error,
            stack: error.stack
        })
    }
}
exports.updateOne = Model =>  async (req, res, next) => {
    try {
     const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
         new: true,
         runValidators: true
     }
     )
 
     res.status(200).json({
         status: 'success',
         data: {
             doc
         }
     })
 }
 catch(error){
     res.status(404).json({
         status: 'fail',
        error,
        stack: error.stack
     })
 }
}
exports.getOne =  (Model, populateOptions) => async (req, res, next) => {
    try{
        const doc = await Model.findOne({ _id: req.params.id}).populate(populateOptions)
 
    if(!doc){
        return  next(new AppError('No doc founded with the given id' , 404));
       }

    res.status(200).json({
        status: 'success',
        data: {
            doc
        } 
    })
    }
    catch(error){
        res.status(404).json({
            status: 'fail',
            error,
            stack: error.stack
        })
    }
    
}
exports.nestedRoute = function(...nestedParamsOptions) {
    return (req, res, next) => {
        const  nestedParams = {};
      const paramsKey = Object.keys(req.params);
   
      if (paramsKey.length === 0 || nestedParamsOptions.length === 0) {
        return next();
      }
   
      const filteredOptions = nestedParamsOptions.filter(el => {
        return paramsKey.includes(el.param);
      });
   
      filteredOptions.forEach(el => {
        nestedParams[el.modelField] = req.params[el.param];
      });
   
      req.nestedParams = nestedParams;
      next();
    };
  };
exports.getAll = (Model) => async (req, res, next) => {
    try {
        // to get nested reviews on tour
        let filter = {}
        if(req.nestedParams) filter =  req.nestedParams;

        const features = new APIFeatures(Model.find(filter), req.query )
        .filter()
        .sort()
        .limiting()
        .paginate();
        // execute query object
        // const docs =  await features.query.explain();
        const docs =  await features.query;
        // Send resonse
       
  res.status(200).json({
            status: 'success',
            results: docs.length,
            data: {
                docs
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
exports.createOne = Model =>
  async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  };