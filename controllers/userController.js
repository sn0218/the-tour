const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

/* // multer disk storage engine: control file to be stored to disk
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // set upload location
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    // filename format: user-userId-timestamp.jpg

    // set file extension
    const ext = file.mimetype.split('/')[1];

    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});
 */

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

// upload user photo function
exports.uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((field) => {
    if (allowedFields.includes(field)) newObj[field] = obj[field];
  });

  return newObj;
};

// resize user uploaded photo
exports.resizePhoto = catchAsync(async (req, res, next) => {
  // if no file in req, pass to next middleware
  if (!req.file) return next();

  // get user photo (buffer object) from memory
  const photo = req.file.buffer;

  // set filename of photo
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // process the uploaded photo and save it
  await sharp(photo)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 80 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

/* exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
}); */

exports.getAllUsers = factory.getAll(User);

/* exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
}); */

exports.getUser = factory.getOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!, Please use /signup.',
  });
};

/* exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
}; */

/* exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
}; */
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getPersonalInfo = (req, res, next) => {
  // set params id as req.user.id
  req.params.id = req.user.id;
  next();
};

exports.updatePersonalInfo = catchAsync(async (req, res, next) => {
  //console.log(req.file);

  // raise error if user provides password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for updating password.', 400));
  }

  // filter fields name in req.body that not allowed to be updated
  const filteredBody = filterObj(req.body, 'username', 'email');

  if (req.file) {
    // add photo field in filteredBody by extracting filename in req.file object
    filteredBody.photo = req.file.filename;
  }

  // update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deactivateUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
