import Category from '../models/categoryModel.js'
import Product from '../models/productModel.js'
import ErrorResponse from '../utils.js/errorResponse.js'
import asyncHandler from 'express-async-handler'

// @desc      Create new category
// @route     POST /api/v1/category
// @access    Private

const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body
  const category = await Category.create({
    name,
  })
  res.status(201).json({ success: true, data: category })
})

// @desc      Get all categories
// @route     GET /api/v1/category
// @access    Public

const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find()
  if (!categories) {
    return next(new ErrorResponse('No categories found', 404))
  }
  res.status(200).json({ success: true, data: categories })
})

// @desc      Get single category
// @route     GET /api/v1/category/:id
// @access    Public

const getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    return next(new ErrorResponse('No category found', 404))
  }
  res.status(200).json({ success: true, data: category })
})

// @desc      Update category
// @route     PUT /api/v1/category/:id
// @access    Private

const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id)
  if (!category) {
    return next(new ErrorResponse('No category found', 404))
  }
  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  res.status(200).json({ success: true, data: category })
})

// @desc      Delete category
// @route     DELETE /api/v1/category/:id
// @access    Private

const deleteCategory = asyncHandler(async (req, res, next) => {
  Category.findById(req.params.id).exec((err, category) => {
    if (err || !category) {
      return next(new ErrorResponse('No category found', 404))
    } else {
      Product.find({ category: category }).exec((err, data) => {
        if (data.length >= 1) {
          return next(
            new ErrorResponse(
              `Category ${category.name} has ${data.length} products. Delete them first`,
              400
            )
          )
        } else {
          category.remove((err, data) => {
            if (err) {
              return next(new ErrorResponse('Error deleting category', 400))
            }
            res.json({
              success: true,
              data: {}
            })
          })
        }
      })
    }
  })
})

export {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
}
