const express = require('express');

const {
  getHomePage,
  getTourPage,
  loginPage,
  registerPage,
  getPersonalPage,
  updateUser,
  getMyBookings,
  getMyBilling,
  getMyReviews,
  getTestPage,
} = require('../controllers/viewController');

const { protect, isLoggedIn } = require('../controllers/authController');

const {
  createBookingCheckout,
} = require('../controllers/tourBookingController');

const router = express.Router();

/* router.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    title: 'Created by Samuel Ng',
    user: 'Samuel',
  });
}); */

router.get('/mypage', protect, getPersonalPage);
router.post('/submit-user-data', protect, updateUser);
router.get('/bookings', protect, getMyBookings);
router.get('/billing', protect, getMyBilling);
router.get('/my-reviews', protect, getMyReviews);

router.use(isLoggedIn);

router.get('/', createBookingCheckout, getHomePage);
router.get('/tours/:slugifiedName', getTourPage);
router.get('/login', loginPage);
router.get('/register', registerPage);
router.get('/test', getTestPage);

module.exports = router;
