const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const fileupload = require('express-fileupload');
const path = require('path');

//@desc         Get all bootcamps
//@route        GET /api/v1/bootcamps
//@access       public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc         Get single bootcamps
//@route        GET/api/v1/bootcamps/:id
//@access       public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id).populate({
    path: 'courses',
    select: 'title description minimumSkill',
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamps not found with the id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({
    sucess: true,
    data: bootcamp,
  });
});

//@desc         Create new bootcamp
//@route        POST /api/v1/bootcamps
//@access       Private
exports.createBootcamp = async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // If the user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role != 'admin') {
    return next(
      new ErrorResponse(
        `The User with ID ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
};

//@desc         Update new bootcamp
//@route        PUT /api/v1/bootcamps/:id
//@access       private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamps not found with the id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure User is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not Authorized to update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

//@desc         Delete new bootcamp
//@route        PUT /api/v1/bootcamps/:id
//@access       private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamps not found with the id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure User is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not Authorized to Delete this bootcamp`,
        401
      )
    );
  }

  bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
});

//@desc         Upload a photo for bootcamp
//@route        PUT /api/v1/bootcamps/:id/photo
//@access       private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamps not found with the id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure User is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not Authorized to upload photo into this bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;
  // Make sure that the file is a image
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload a valid Image file`, 400));
  }

  //Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  //Create custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse('Ouch..! Problem with file Upload', 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, {
      photo: `http://localhost:5000/uploads/` + file.name,
    });

    res.status(200).json({
      success: true,
      data: `http://localhost:5000/uploads/` + file.name,
    });
  });

  console.log(file.name);
});
