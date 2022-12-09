const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// jwt token generator by payload and secret key and specifiy token expire day
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  //console.log(user._id);

  // define cookie options
  const cookieOptions = {
    // expiry date: 90 days after current timestamp
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // cookie can only be sent or received but cannot be accessed or modified
  };

  // set cookies option with HTTPS in production
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  // attach cookies to res obj
  res.cookie('jwt', token, cookieOptions);

  // hide password field in user obj output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  //const newUser = await User.create(req.body);
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    /*     passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role, */
  });

  // send welcome email after sign up an account
  const url = `${req.protocol}://${req.get('host')}/mypage`;
  await new Email(newUser, url).sendWellcome();

  // generate jwt token
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // ES6 destructuring to get login crediential from req body
  const { email, password } = req.body;

  // verify if email and password exist
  if (!email || !password) {
    const opError = new AppError('Missing email or password', 400);
    return next(opError);
  }

  // verify if user exist and password is correct
  // find document by email and explicity selected password
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.comparePassword(password, user.password))) {
    const opError = new AppError('Incorrect email or password', 401);
    return next(opError);
  }

  // send token to client
  createSendToken(user, 200, res);
  //console.log(user);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // check auth header and extract token and extract jwt token from auth header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // check cookies band extract the jwt token from cookies
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('Unauthorized access. Please log in to access.', 401)
    );
  }

  // verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  // check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    const err = new AppError(
      'The user belonging to this token does no longer exist',
      401
    );
    return next(err);
  }

  // check if user changed password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    const err = new AppError(
      'You changed password recently. Please log in again.',
      401
    );
    return next(err);
  }

  // pass the currentUser as req.user after the token verification
  req.user = currentUser;

  // pass the user to template engine if user is logged in
  res.locals.user = currentUser;

  //console.log(req.user);
  // go to the next middlehandler to grant access to protected route
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    console.log(req.user);
    // check the user's role
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );

    next();
  };

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // get user by email from requested data
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(
      new AppError('No user exists with the given email address', 404)
    );

  // generate random reset token
  const resetToken = user.createPasswordResetToken();

  // deactive validator to save field in user document
  await user.save({ validateBeforeSave: false });

  //const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to:\n${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    /* await sendEmail({
      email: user.email,
      subject: 'Reset Password - get you reset password token',
      message: message,
    }); */
    // send resetToken to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    // send reset password email
    await new Email(user, resetURL).sendResetPassword();

    res.status(200).json({
      status: 'success',
      message: 'Reset token is sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordRestExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('Error occurs in sending the email. Please try later.', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user by token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if token has not expired and user exists, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or expired.', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // update the changedPasswordAt field in DB

  // log in the requested user automatically
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // check if provided current password is correct
  if (!(await user.comparePassword(req.body.passwordCurrent, user.password))) {
    const opError = new AppError('Incorrect email or password', 401);
    return next(opError);
  }

  // update password if provided password is correct
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // log in the requested user
  createSendToken(user, 200, res);
});

exports.isLoggedIn = async (req, res, next) => {
  // check jwt exists in cookie
  if (req.cookies.jwt) {
    // extract the jwt token from cookies
    try {
      // verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // check if user changed password after the token was issued
      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next();
      }

      // pass the user to template engine if user is logged in
      res.locals.user = currentUser;
      return next();

      // catch malformed jwt or logout jwt
    } catch (err) {
      return next();
    }
  }
  // no cookie, then pass to next middleware
  next();
};

exports.logout = (req, res) => {
  // send a new cookie without jwt to overwrite the existing cookie
  res.cookie('jwt', 'logout', {
    // expire in 10s
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
