const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // parent reference to tour
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour.'],
  },
  // parent reference to user
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User.'],
  },
  price: {
    type: Number,
    require: [true, 'Booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

// QUERY MIDDLEWARE: populate tour field and user field
bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'username',
  }).populate({
    path: 'tour',
    select: 'name startLocation startDates',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
