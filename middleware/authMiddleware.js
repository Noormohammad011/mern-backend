import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import ErrorResponse from '../utils.js/errorResponse.js'
import expressAsyncHandler from 'express-async-handler'

// Protect routes
const protect = expressAsyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1]
    // Set token from cookie
  }
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)
    next()
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }
})

// Grant access to specific roles
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    return next(new ErrorResponse('Not authorized as an admin', 403))
  }
}

export { protect, admin }
