const AppError = require('../utils/appError');

// ERROR HANDLERS
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((error) => error.message);
  const message = `Invalid input data. ${errors.join(' | ')}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

// transform mongoDB error into readable error
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  const message = 'Invalid token. Please log in to access.';
  return new AppError(message, 401);
};

const handleJWTExpiredError = () => {
  const message = 'Token is expired. Please log in again.';
  return new AppError(message, 401);
};

// DEV and PROD ERROR SENDER
const sendErrorDev = (err, req, res) => {
  // API Error
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // render error template
  console.error(err);
  return res.status(err.statusCode).render('error', {
    title: 'Error occurs.',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // API Error
  if (req.originalUrl.startsWith('/api')) {
    // operational error
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // programming error or unknow error
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: 'Something goes wrong in the server.',
    });
  }

  // render error template
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Error occurs.',
      msg: err.message,
    });
  }
  // programming error or unknow error
  console.error(err);
  return res.status(err.statusCode).render('error', {
    title: 'Error occurs.',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // deep copy of response err
    let error = JSON.parse(JSON.stringify(err));
    //error['message'] = err.message;
    error.message = err.message;

    // handle cast error
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    // handle duplicated field error
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // handle validation error
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    // handle jwt error
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    // handle jwt expired error
    if (error.name === 'handleJWTExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
