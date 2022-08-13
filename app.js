const express = require('express');
const morgan = require('morgan');

const app = express();
const AppError = require('./utils/AppError');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongo_sanitization = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
// console.log(app.get('env'));

// console.log(process.env.USER);

////// 1 GLOBAL  MIDDLEWARES

// http security
app.use(helmet());

// body parser
app.use(express.json());
// middleware for accessing static files
app.use(express.static(`${__dirname}/public`));

// Data sanitization against nosql query injection
app.use(mongo_sanitization());
// Data sanization for xss (html, css, js code)
app.use(xss());

// http parameter pollution

// app.use(hpp({
//   whitelist: [
//     "sort"
//   ]
// }))



const limiter = rateLimit({
  max: 100,
  windowMs: 60*60*1000,
  message: 'Too many requests  from this IP Please try again after an hour'
})
// rate limiter
app.use('/api' , limiter);


// development logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// app.use((req, res, nxt) => {
//     console.log('Hello from the middleware 🙌🙌')
//     nxt()
// })

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

////// 2  ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// bad request handler
app.all( '*', (req, res, next) =>{
 next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));

})
// error handler
app.use(globalErrorHandler);

////// 3 START SERVER

module.exports = app;
