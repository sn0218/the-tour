const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // get the booked tour
  const tour = await Tour.findById(req.params.tourId);

  // create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${
      tour.slugifiedName
    }`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`,
            ],
          },
        },
      },
    ],
  });

  // respond to checkout session
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // get variables from URL query (not secure at this moment)
  const { tour, user, price } = req.query;

  if (!(tour || user || price)) return next();

  await Booking.create({ tour, user, price });

  // redirect to my bookings page
  res.redirect(`${req.protocol}://${req.get('host')}/bookings`);
});

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

exports.deleteMyBooking = catchAsync(async (req, res, next) => {
  // find the booking booked by the user and delete it
  const doc = await Booking.findOneAndDelete({
    user: req.user.id,
    _id: req.params.id,
  });

  if (!doc) {
    const notFoundError = new AppError(
      `No document is found with the id: ${req.params.id}`,
      404
    );
    // propagate the error to error handling middleware
    return next(notFoundError);
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
