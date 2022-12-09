const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name.'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must have less than or equal to 40 characters.',
      ],
      minlength: [10, 'A tour name must have at least 10 characters.'],
      /* validate: [
        validator.isAlpha,
        'Tour name must only contain alphabetical characters.',
      ], */
    },
    // convert to URL optimized string
    /* e.g. Hello World -> hello-world */
    slugifiedName: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration.'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size.'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult.',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0.'],
      max: [5, 'Rating must be below 5.0.'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price.'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW doc creation
          return val < this.price;
        },
        message: 'Discount price should be below marked price.',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // customized object type
      type: {
        type: String,
        default: 'Point',
        enums: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        // customized object type
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    /* // embed user doc
    guides: Array, */
    // reference user doc
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    /*  reviews: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Review'
      }
    ] */
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// INCREASE QUERY PERFORMANCE IN DB: set compound index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slugifiedName: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// virtual property (not save in DB)
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate review doc in parent referencing
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slugifiedName = slugify(this.name, { lower: true });
  next();
});

/* // embed user doc by POSTED user id
tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});
 */
/* // 2ND DOCUMENT MIDDLEWARE:
// eslint-disable-next-line prefer-arrow-callback
tourSchema.pre('save', function (next) {
  console.log('Mongoose middleware: Will save document...');
  next();
});

// 3RD DOCUMENT MIDDLEWARE: runs after .save() and .create()
// eslint-disable-next-line prefer-arrow-callback
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
}); */

// QUERY MIDDLEWARE: offer secret query that secret tour is hidden in public API.
// apply regular expression to all query functions starts with find
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// 2ND QUERY MIDDLEWARE
tourSchema.post(/^find/, function (docs, next) {
  console.log(
    `Time taken for tour query middleware: ${Date.now() - this.start} ms`
  );
  //console.log(docs[0]);
  next();
});

// 3RD QUERY MIDDLEWARE: populate guides field data
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

/* // AGGREGATION MIDDLEWARE: remove secret tour from regular aggregation
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
}); */

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
