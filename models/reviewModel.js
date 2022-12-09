const mongoose = require('mongoose');
const Tour = require('./tourModel');
//const User = require('./userModel');

const reviewSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Ar eview must have content'],
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a tour.'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // parent reference to tour
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0.'],
      max: [5, 'Rating must be below 5.0.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// set unique compound index (tour and author) to prevent duplicated review
reviewSchema.index({ tour: 1, author: 1 }, { unique: true });

// QUERY MIDDLEWARE: populate author field
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    select: 'name -guides',
  }).populate({
    path: 'author',
    select: 'username photo',
  });
  next();
});

/* calculate avg ratings of tour when creating/updating/deleting a review */

// STATIC METHOD: calculate average ratings and no. of ratings for given tourId that the current review was created
reviewSchema.statics.calRatingsAvg = async function (tourId) {
  // pass the stages in model aggregation
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        ratingNum: { $sum: 1 },
        ratingAvg: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  // if stats array is not empty
  if (stats.length > 0) {
    // update current tour ratingsAvg and ratingQuantity
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].ratingAvg,
      ratingsQuantity: stats[0].ratingNum,
    });
    // if no review on the tour
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

// DOCUMENT MIDDLEWARE: calculate avg. rating of the tour after creating the review doc
reviewSchema.post('save', function () {
  // this refers to current review model
  // call the document constructor static method to calculate ratingsAvg of the review
  this.constructor.calRatingsAvg(this.tour);
  //Review.calRatingsAvg(this.tour)
});

// QUERY MIDDLEWARE: extract the review doc when updating/deleting review
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // store the doc in static variable
  this.reviewDoc = await this.findOne();
  next();
});

// QUERY MIDDLEWARE: get the tourId from static variable and recalculate the avg. rating after updating/deleting the review doc
reviewSchema.post(/^findOneAnd/, async function () {
  await this.reviewDoc.constructor.calRatingsAvg(this.reviewDoc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
