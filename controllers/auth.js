const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const fileupload = require('express-fileupload');

//@desc         Register User
//@route        POST /api/v1/auth/register
//@access       private
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create User
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

//@desc         Login User
//@route        POST /api/v1/auth/login
//@access       public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //   Validate Email and Password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and Password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid Credential', 401));
  }

  // check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid Credential', 401));
  }

  sendTokenResponse(user, 200, res);
});

//@desc         Get current logged in user
//@route        POST /api/v1/auth/me
//@access       private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc         Update User details
//@route        PUT /api/v1/auth/updatedetails
//@access       private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc        Update Password
//@route        PUT /api/v1/auth/updatepassword
//@access       private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current passowrd
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is Incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Get token from model, create cookie and send respond
const sendTokenResponse = (user, stastusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(stastusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};

//@desc         Forgot password
//@route        POST /api/v1/auth/forgotpassword
//@access       public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get Reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: user,
  });
});
