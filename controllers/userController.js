import User from '../models/userModel.js'
import ErrorResponse from '../utils.js/errorResponse.js'
import asyncHandler from 'express-async-handler'
// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public

const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  })

  sendTokenResponse(user, 200, res)
})

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Invalid credentials', 400))
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password)

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }

  sendTokenResponse(user, 200, res)
})

//@dec         Log user out / clear cookie
//@route       GET /api/v1/auth/logout
//@access      Public

const logout = asyncHandler(async (req, res, next) => {
  res.clearCookie('token')
  res.status(200).json({ success: true, data: {} })
})

// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private

const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    return next(new ErrorResponse('User not found', 404))
  }
  res.status(200).json({ success: true, data: user })
})

//@dec       Update user details
//@route     PUT /api/v1/auth/update
//@access    Private

const updateUserDetails = asyncHandler(async (req, res, next) => {
  const { name, password } = req.body

  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err || !user) {
      return next(new ErrorResponse('User not found', 404))
    }
    if (!name) {
      return next(new ErrorResponse('Name is required', 400))
    } else {
      user.name = name
    }

    if (password) {
      if (password.length < 6) {
        return next(
          new ErrorResponse('Password must be at least 6 characters', 400)
        )
      } else {
        user.password = password
      }
    }

    user.save((err, updatedUser) => {
      if (err) {
        return next(new ErrorResponse('User update failed', 400))
      }

      sendTokenResponse(updatedUser, 200, res)
    })
  })
})

//@dec     update admin user details
//@route   PUT /api/v1/auth/update/:id
//@access  Private/Admin

const updateAdminUser = asyncHandler(async (req, res, next) => {
  const { name, email, isAdmin } = req.body
  const user = await User.findById(req.params.id)
  if (user) {
    user.name = name || user.name
    user.email = email || user.email
    user.isAdmin = isAdmin

    const updatedUser = await user.save()

    sendTokenResponse(updatedUser, 200, res)
  } else {
    return next(new ErrorResponse('User not found', 404))
  }
})

//@dec     Get all users
//@route   POST /api/v1/auth/all
//@access  Private/Admin

const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({}).select('-password')
  if (!users) {
    return next(new ErrorResponse('No users found', 404))
  }
  res.status(200).json({ success: true, data: users })
})

//get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken()

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  }

  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    data: user,
  })
}

export {
  register,
  login,
  logout,
  getMe,
  updateUserDetails,
  updateAdminUser,
  getAllUsers,
}
