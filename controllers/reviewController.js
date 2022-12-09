const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');

/* exports.getAllReviews = async (req, res, next) => {
  let filter = {};
  // check if req.pararms.id passed by merging params
  if (req.params.id) {
    // set filter for specified tour's id
    filter = { tour: req.params.id };
  }
  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
}; */

exports.getAllReviews = factory.getAll(Review);

/* exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    const notFoundError = new AppError(
      `No review is found with the id: ${req.params.id}`,
      404
    );
    return next(notFoundError);
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
}); */

exports.getReview = factory.getOne(Review);

/* exports.createReview = catchAsync(async (req, res, next) => {
  // if tour field is not specified, set tour id from req.params
  if (!req.body.tour) {
    req.body.tour = req.params.id;
  }

  // if author field is not specified, set author id from req.user
  if (!req.body.author) {
    req.body.author = req.user.id;
  }

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
}); */

// middleware function to set tour id and user id
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.id;
  }

  // if author field is not specified, set author id from req.user
  if (!req.body.author) {
    req.body.author = req.user.id;
  }

  next();
};

exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
