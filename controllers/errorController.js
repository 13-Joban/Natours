const AppError = require('./../utils/AppError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJwtError = err =>   new AppError('Invalid token, please login again', 401);
const handleTokenExpireError  = err => new AppError('Token expired , please login again ', 401)


const sendErrorDev = (err, res) => {
  

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = {...err, name: err.name};

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if(error.name === 'JsonWebTokenError') error = handleJwtError(error);
    if(error.name === 'TokenExpiredError') error = handleTokenExpireError(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // if (error._message === 'Tour validation failed')
    //   error = handleValidationErrorDB(error);

      console.log('prod')
    sendErrorProd(error, res);
  }
};
