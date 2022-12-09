const express = require('express');
const {
  getCheckoutSession,
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  deleteMyBooking,
} = require('../controllers/tourBookingController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();
router.use(protect);
// for client side get checkout session
router.get('/checkout-session/:tourId', getCheckoutSession);

router.route('/:id').delete(protect, deleteMyBooking);

router.use(restrictTo('admin', 'lead-guide'));
router.route('/').get(getAllBookings).post(createBooking);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
