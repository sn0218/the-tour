const express = require('express');

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updatePersonalInfo,
  deactivateUser,
  getPersonalInfo,
  uploadUserPhoto,
  resizePhoto,
} = require('../controllers/userController');

const {
  signup,
  login,
  logout,
  forgetPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require('../controllers/authController');

// create express router
const router = express.Router();

// authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgetpassword', forgetPassword);
router.patch('/resetpassword/:token', resetPassword);

// set protect middleware for all routes in below
router.use(protect);

router.patch('/updatepassword', protect, updatePassword);

// user routes
router.get('/personalInfo', protect, getPersonalInfo, getUser);
router.patch(
  '/updateinfo',
  protect,
  uploadUserPhoto,
  resizePhoto,
  updatePersonalInfo
);
router.delete('/deactivate', protect, deactivateUser);

// set protect middleware for admin only acessing the following routes
router.use(protect, restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
