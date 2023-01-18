import express from 'express'
const router = express.Router()
import { admin, protect } from '../middleware/authMiddleware.js'
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getCategories,
  getProduct,
  getRelatedProducts,
  productById,
  productSearch,
  updateProduct,
  listBySearch,
  getPhoto,
} from '../controllers/productController.js'


router.route('/by/search').post(listBySearch)
router.route('/search').get(productSearch)
router.route('/categories').get(getCategories)
router.route('/').post(protect, admin, createProduct).get(getAllProducts)
router
  .route('/:id')
  .get(getProduct)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct)
router.route('/related/:productId').get(getRelatedProducts)
router.route('/photo/:productId').get(getPhoto)

router.param('productId', productById)
export default router
