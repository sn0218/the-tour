const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'A user must have a username.'],
    unique: true,
    trim: true,
    maxlength: [32, 'Username must have at most 32 characters'],
    minlength: [6, 'Username must have at least 6 characters'],
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: [true, 'Email address is required.'],
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // callback function works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  photo: { type: String, default: 'default.jpg' },
});

// 1st DOC MIDDLEWARE before save doc
userSchema.pre('save', async function (next) {
  // if password is modified, run the next middleware
  if (!this.isModified('password')) return next();

  // hash the user password before saving into DB
  this.password = await bcrypt.hash(this.password, 12);

  // delete the field
  this.passwordConfirm = undefined;

  next();
});

// 2ND DOC MIDDLEWARE before save doc
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// QUERY MIDDLEWARE before query
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// SCHEMA METHOD: compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// SCHEMA METHOD: check changed password
userSchema.methods.changePasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    // change the DB timestamp format for comparison
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //console.log(changedTimestamp, jwtTimeStamp);

    return jwtTimeStamp < changedTimestamp;
  }
  return false;
};

// SCHEMA METHOD: create password reset token
userSchema.methods.createPasswordResetToken = function () {
  // generate 32 bytes hex reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // hash the reset token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //console.log({ resetToken }, this.passwordResetToken);

  // set password reset expiration time as 10 mins
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
