import express from 'express'
const router = express.Router()
import { admin, protect } from '../middleware/authMiddleware.js'
import {
  getAllUsers,
  getMe,
  login,
  logout,
  register,
  updateAdminUser,
  updateUserDetails,
} from '../controllers/userController.js'

router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)
router.get('/me', protect, getMe)
router.get('/all', protect, admin, getAllUsers)
router.put('/update', protect, updateUserDetails)
router.put('/update/:id', protect, admin, updateAdminUser)

export default router
