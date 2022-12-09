const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// save the uploaded file to memory
const multerStorage = multer.memoryStorage();

// control only image files are accepted
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    const fileTypeErr = new AppError(
      'The uploaded file is not an image. Please try again!',
      400
    );
    cb(fileTypeErr, false);
  }
};

// set multer middleware
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// upload tour images function
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// resize tour images
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);

  // if no imageCover or tour images are uploaded, pass to next middleware
  if (!req.files.imageCover || !req.files.images) return next();

  // process coverImage and save it
  const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  const imageCover = req.files.imageCover[0].buffer;
  await sharp(imageCover)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 80 })
    .toFile(`public/img/tours/${imageCoverFilename}`);

  // set imageCover field in req.body for further update imageCover name in DB
  req.body.imageCover = imageCoverFilename;

  // process tour images
  req.body.images = [];

  // save the promise in array and await all promises to persist all image filename into DB
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toFile(`public/img/tours/${filename}`);

      // set images field in req.body
      req.body.images.push(filename);
    })
  );

  next();
});

//const fs = require('fs');
//const { query } = require('express');

/* const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
); */

// middleware function for param middleware
/* exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }
  next();
}; */

// middleware function for check body
/* exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(404).json({
      status: 'fail',
      message: 'no name or price',
    });
  }
  next();
}; */

// prefill the query before reaching the getAllTours handler
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   /* // BUILD QUERY: shallow copy of all key-value pairs
//     const queryObject = { ...req.query };
//     console.log(queryObject);

//     // filtering fields
//     const excludedFields = ['page', 'sort', 'limit', 'fields'];
//     excludedFields.forEach((el) => delete queryObject[el]);
//     console.log(queryObject);

//     // advance filttering
//     let queryStr = JSON.stringify(queryObject);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     // mongoDB filtering in req param
//     // {difficulty: 'easy', duration: {$gte: 5}}
//     // gte, gt, lte, lt

//     // prepare to build the query chain
//     let query = Tour.find(JSON.parse(queryStr));

//     // sorting
//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(',').join(' ');
//       query = query.sort(sortBy);
//     } else {
//       // set default sort if no sort field is provided
//       query = query.sort();
//     } */

//   // field limiting
//   /* if (req.query.fields) {
//       const fields = req.query.fields.split(',').join(' ');
//       query = query.select(fields);
//     } else {
//       // excluding '--V' field in schema
//       query = query.select('-__v');
//     }

//     // pagination
//     const page = req.query.page * 1 || 1;
//     const limit = req.query.limit * 1 || 100;
//     const skipPage = (page - 1) * limit;
//     query = query.skip(skipPage).limit(limit);
//     console.log(page, limit, skipPage);
//     if (req.query.page) {
//       const ToursNum = await Tour.countDocuments();
//       if (skipPage >= ToursNum) throw new Error('This page does not exist.');
//     } */

//   // EXECUTION QUERY: query documents in DB
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   /* const tours = await Tour.find()
//       .where('duration')
//       .equals(5)
//       .where('difficulty')
//       .equals('easy'); */

//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

exports.getAllTours = factory.getAll(Tour);

// exports.getTour = catchAsync(async (req, res, next) => {
//   // show URL parameter
//   //console.log(req.params);

//   /*   // convert id to int type
//   const id = req.params.id * 1;

//   const tour = tours.find((item) => item.id === id); */

//   // query a document by MongoDB ID
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   /* const tour = await Tour.findById(req.params.id).populate({
//     path: 'guides',
//     select: '-__v -passwordChangedAt',
//   }); */

//   if (!tour) {
//     const notFoundError = new AppError(
//       `No tour is found with the id: ${req.params.id}`,
//       404
//     );
//     // propagate the error to error handling middleware
//     return next(notFoundError);
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

/* exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
}); */

exports.createTour = factory.createOne(Tour);
/* try {
    res.status(200).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  } */
//console.log(req.body);

/* // set ID for new tour
  const newId = tours[tours.length - 1].id + 1;

  // create new tour object
  const newTour = Object.assign({ id: newId }, req.body);

  // push new tour into tours array
  tours.push(newTour);

  // convert JS object into JSON string and write to the json file
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  ); */

/* exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
}); */

exports.updateTour = factory.updateOne(Tour);

/* exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    const notFoundError = new AppError(
      `No tour is found with the id: ${req.params.id}`,
      404
    );
    // propagate the error to error handling middleware
    return next(notFoundError);
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
}); */

exports.deleteTour = factory.deleteOne(Tour);

// aggregation pipeline to transform doc into an aggregated result
exports.getTourStats = catchAsync(async (req, res, next) => {
  // get the aggregate stats in each stage in aggregation pipeline
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    // group stats for different fields
    {
      $group: {
        // calculate stats for all tours grouped by field (_id)
        _id: { $toUpper: '$difficulty' },
        //_id: '$ratingsAverage',
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      // sort in ascending order
      $sort: { avgPrice: 1 },
    },
    /* // repeated stage
      {
        $match: { _id: { $ne: 'EASY' } },
      }, */
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      // destructure an field from input doc, output one doc for each elemnt of the array of the field
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        // count number of tours at that month
        numTourStarts: { $sum: 1 },
        // create array to store tour's Name at that month
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      // hide the _id field in output by setting zero
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    length: plan.length,
    data: {
      plan,
    },
  });
});

exports.discoverTours = catchAsync(async (req, res, next) => {
  // destructure URL params
  const { range, coordinate, unit } = req.params;

  // extract latitude and longitude
  const [lat, long] = coordinate.split(',');

  // extract range and calculate radius in rad
  const radius = unit === 'km' ? range / 6378.1 : range / 3963.2;

  // check if lat or long exists
  if (!lat || !long) {
    const opErr = new AppError(
      'Please provide valid coordinate in latitude, longtitude.',
      400
    );
    return next(opErr);
  }

  // search tour doc by geospatial location
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
  });

  console.log(range, lat, long, unit);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  // destructure URL params
  const { coordinate, unit } = req.params;

  // extract latitude and longitude
  const [lat, long] = coordinate.split(',');

  // check if lat or long exists
  if (!lat || !long) {
    const opErr = new AppError(
      'Please provide valid coordinate in latitude, longtitude.',
      400
    );
    return next(opErr);
  }

  const disMultiplier = unit === 'km' ? 0.001 : 0.000621371;

  // compute distances using aggregation pipeline
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [long * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: disMultiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
