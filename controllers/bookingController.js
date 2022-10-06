const Stripe = require('stripe')
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const factory = require('./handleFactory');

exports.getCheckoutSession = async (req, res, next) => {
 
  try {
     // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
//   console.log(tour);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
  });
  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
  } catch (error) {
    
    res.status(404).json({
        status: 'fail',
        error,
        stack: error.stack
    })
  }
};

exports.createBookingCheckout = async (req, res, next) => {
    try {
         // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            error,
            stack: error.stack
        })
    }
 
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
