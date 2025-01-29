const Auth = require("../models/authModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const AppError = require("./../utils/appError");
dotenv.config({ path: "../.env" });
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.SECRETKEY, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {

  const { name, email, password, passwordConfirmed } = req.body;

  if (!name || !email || !password || !passwordConfirmed) {
    return res.status(400).json({
      status: "fail",
      message:
        "Missing required fields: name, email, password, or passwordConfirmed",
    });
  }

 
  const newUser = await Auth.create({
    name,
    email,
    password,
    passwordConfirmed,
    passwordChangedAt: req.body.passwordChangedAt,
  });


  const token = signToken(newUser._id);

 
  res.status(200).json({
    status: "success",
    token,
    data: {
      newUser,
    },
  });
});


exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1.> checking is email and password exist;
  if (!email || !password)
    return next(new AppError("please enter email and passowrd", 401));

  //2.> checking is email is valid and password is correct
  const user = await Auth.findOne({ email: email }).select("+password");

  //3.> checking the  passowrd correct logic
  if (!user || !(await user.correctpassword(password, user.password)))
    return next(new AppError("Either email or password is incorrect"));

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    userId: user._id,
    token,
  });
});

exports.protected = catchAsync(async (req, res, next) => {
  let usertoken;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    usertoken = req.headers.authorization.split(" ")[1]; // Extract the token
  }

  if (!usertoken) {
    return next(
      new AppError("You are not logged in. Please log in to get access.", 401)
    );
  }

  const decode = await jwt.verify(usertoken, process.env.SECRETKEY);
  const currentUser = await Auth.findById(decode.id);

  if (!currentUser) {
    return next(
      new AppError("The token belongs to a user who no longer exists", 401)
    );
  }

  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(new AppError("User has recently changed their password", 401));
  }

  req.user = currentUser;
  next();
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await Auth.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("Please enter the correct email", 401));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `Click on the link below to reset your password: ${resetURL}.\nIf you did not request this, please ignore.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.PasswordResetToken = undefined;
    user.PasswordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("Something went wrong. Please try again later.", 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashtoken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await Auth.findOne({
    PasswordResetToken: hashtoken,
    PasswordResetExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(new AppError("Token is expired or invalid"), 400);
  }

  user.password = req.body.password;
  user.passwordConfirmed = req.body.passwordConfirmed;
  user.PasswordResetExpire = undefined;
  user.PasswordResetToken = undefined;

  await user.save();
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.renderResetPasswordPage = (req, res) => {
  const token = req.params.token;
  console.log(token)
  res.render("resetpasswordpage", { token });
};
