const express = require('express');
const morgan = require('morgan');
const path = require('path');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/tourBookingRoutes');

const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');

const app = express();

// set template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// display node env
console.log(process.env.NODE_ENV);

/* GLOBAL MIDDLEWAIRES */
// set security HTTP headers
app.use(helmet());
/* helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'http:', 'data:'],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
    },
  })
); */

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// rate limiter middleware: 1000 requests per hr
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
});

// set limiter in api route
app.use('/api', limiter);

// express body parser to read req.body from req obj
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// data sanitization aginst NoSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS attack
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// serve static files for the specified path
app.use(express.static(path.join(__dirname, 'public')));

/* // create global middleware function
app.use((req, res, next) => {
  console.log('Global middleware in execution.');
  next();
}); */

// custom middleware to log request time of request object
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  console.log(req.cookies);
  next();
});

/* app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello from the server side!',
    app: 'Natours',
  });
});

app.post('/', (req, res) => {
  res.send('You can post to this endpoint...');
}); */

// 2) route handlers

/* // end point to get all tours
app.get('/api/v1/tours', getAllTours);

// end point to get a single tours by providing id
app.get('/api/v1/tours/:id', getTour);

// end point to post new tour
app.post('/api/v1/tours', createTour);

// end point to update a tour
app.patch('/api/v1/tours/:id', updateTour);

// end point to delete a tour
app.delete('/api/v1/tours/:id', deleteTour); */

// 3) routes
// connect app to express router middleware
// mount middlewares to the routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// handle undefined route
app.all('*', (req, res, next) => {
  /* res.status(404).json({
    status: 'fail',
    message: `The route ${req.originalUrl} is not found.`,
  }); */

  /* const err = new Error(`The route ${req.originalUrl} is not found.`);
  err.status = 'fail';
  err.statusCode = 404; */

  // pass arg into next to let express know error
  const opError = new AppError(
    `The route ${req.originalUrl} is not found.`,
    404
  );
  next(opError);
});

// global error handling middleware
app.use(errorHandler);

module.exports = app;
