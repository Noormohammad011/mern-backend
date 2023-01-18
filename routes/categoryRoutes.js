import express from 'express'
const router = express.Router()
import { admin, protect } from '../middleware/authMiddleware.js'
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js'

router.route('/').get(getCategories)
router.route('/:id').get(getCategory).put(protect, admin, updateCategory).delete(protect, admin, deleteCategory)
router.post('/create', protect, admin, createCategory)

export default router
