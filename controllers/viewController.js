const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getHomePage = catchAsync(async (req, res) => {
  // Get tour from collection
  const tours = await Tour.find();

  res.status(200).render('home', {
    title: '',
    tours: tours,
  });
});

exports.getTourPage = catchAsync(async (req, res, next) => {
  const { slugifiedName } = req.params;

  // query the tour and populate the reviews
  const tour = await Tour.findOne({ slugifiedName: slugifiedName }).populate({
    path: 'reviews',
    fields: 'content rating author',
  });

  // if tour does not exist
  if (!tour) {
    const opErr = new AppError('The requested tour does not exist.');
    return next(opErr);
  }

  res.status(200).render('tour', {
    title: `- ${tour.name}`,
    tour: tour,
  });
});

exports.loginPage = (req, res) => {
  res.status(200).render('login', {
    title: `- Sign in`,
  });
};

exports.registerPage = (req, res) => {
  res.status(200).render('register', {
    title: `- Register account`,
  });
};

exports.getPersonalPage = (req, res) => {
  res.status(200).render('personalPage', {
    title: `- My Personal Page`,
  });
};

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      username: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('personalPage', {
    title: `- My Personal Page`,
    user: user,
  });
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  // query for user's bookings (chronological order)
  const bookings = await Booking.find({ user: req.user.id }).sort('-createdAt');

  // get returned tour ids from bookings
  const tourIds = bookings.map((booking) => booking.tour);
  // query for tours by toursIds
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('bookings', {
    title: '- My Bookings',
    bookings: bookings,
    tours: tours,
  });
});

exports.getMyBilling = catchAsync(async (req, res, next) => {
  // query for user's bookings
  const bookings = await Booking.find({ user: req.user.id });

  // get returned tour ids from bookings
  const tourIds = bookings.map((booking) => booking.tour);

  // query for tours by toursIds
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('billing', {
    title: '- My Billing',
    bookings: bookings,
    tours: tours,
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  // query for user's bookings
  const reviews = await Review.find({ author: req.user.id }).sort('-createdAt');

  // get returned tour ids from bookings
  const tourIds = reviews.map((review) => review.tour);

  // query for tours by toursIds
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('reviews', {
    title: '- My Reviews',
    reviews: reviews,
    tours: tours,
  });
});

exports.getTestPage = (req, res) => {
  res.status(200).render('test', {
    title: `- Test`,
  });
};
