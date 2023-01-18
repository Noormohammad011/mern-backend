import Product from '../models/productModel.js'
import ErrorResponse from '../utils.js/errorResponse.js'
import asyncHandler from 'express-async-handler'
import formidable from 'formidable'
import fs from 'fs'
import _ from 'lodash'

//ProductById Middleware
const productById = asyncHandler(async (req, res, next, id) => {
  const product = await Product.findById(id).populate('category')
  if (!product) {
    next(new ErrorResponse('Product not found', 404))
  }
  req.product = product
  next()
})
//get photo middleware
const getPhoto = asyncHandler(async (req, res, next) => { 
  if (req.product.photo.data) {
    res.set('Content-Type', req.product.photo.contentType)
    return res.send(req.product.photo.data)
  }
  next()
})





// @desc      Create new product
// @route     POST /api/v1/product
// @access    Private

const createProduct = asyncHandler(async (req, res, next) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(new ErrorResponse('Image could not be uploaded', 400))
    }
    // check for all fields
    const { name, description, price, category, quantity, shipping } = fields
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping
    ) {
      next(new ErrorResponse('All fields are required', 400))
    }
    let product = new Product(fields)
    if (files.photo) {
      if (files.photo.size > 1000000) {
        next(new ErrorResponse('Image should be less than 1mb in size', 400))
      }
      product.photo.data = fs.readFileSync(files.photo.filepath)
      product.photo.contentType = files.photo.mimetype
    }
    product.save((err, result) => {
      if (err) {
        next(new ErrorResponse('Could not save product', 400))
      }
      res.json({
        success: true,
        data: result,
      })
    })
  })
})

// @desc      Get Single Product
// @route     GET /api/v1/product/:id
// @access    Public

const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).select('-photo')
  if (!product) {
    next(new ErrorResponse('Product not found', 404))
  }
  res.json({
    success: true,
    data: product,
  })
})

// @desc      Delete Single Product
// @route     DELETE /api/v1/product/:id
// @access    Private

const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    next(new ErrorResponse('Product not found', 404))
  }
  product.remove()
  res.json({
    success: true,
    data: {},
  })
})

// @desc      Get All Products
// @route     GET /api/v1/product
// @access    Public

const getAllProducts = asyncHandler(async (req, res, next) => {
  let order = req.query.order ? req.query.order : 'asc'
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  let limit = req.query.limit ? parseInt(req.query.limit) : 6
  const products = await Product.find({})
    .select('-photo')
    .populate('category')
    .sort([[sortBy, order]])
    .limit(limit)
  res.json({
    success: true,
    data: products,
  })
})

// @desc      Update Single Product
// @route     PUT /api/v1/product/:id
// @access    Private

const updateProduct = asyncHandler(async (req, res, next) => {
  Product.findById(req.params.id, (err, product) => {
    if (err || !product) {
      next(new ErrorResponse('Product not found', 404))
    }
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
      if (err) {
        next(new ErrorResponse('Image could not be uploaded', 400))
      }
      // check for all fields
      const { name, description, price, category, quantity, shipping } = fields
      if (
        !name ||
        !description ||
        !price ||
        !category ||
        !quantity ||
        !shipping
      ) {
        next(new ErrorResponse('All fields are required', 400))
      }
      product = _.extend(product, fields)
      if (files.photo) {
        if (files.photo.size > 1000000) {
          next(new ErrorResponse('Image should be less than 1mb in size', 400))
        }
        product.photo.data = fs.readFileSync(files.photo.filepath)
        product.photo.contentType = files.photo.mimetype
      }
      product.save((err, result) => {
        if (err) {
          next(new ErrorResponse('Could not save product', 400))
        }
        res.json({
          success: true,
          data: result,
        })
      })
    })
  })
})

// @desc      Get Related Products
// @route     GET /api/v1/product/related/:id
// @access    Public
const getRelatedProducts = asyncHandler(async (req, res, next) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6
  const products = await Product.find({
    _id: { $ne: req.product },
    category: req.product.category,
  })
    .populate('category', '_id name')
    .limit(limit)
  if (!products) {
    next(new ErrorResponse('Products not found', 404))
  }
  res.status(200).json({
    success: true,
    data: products,
  })
})

// @desc      Distinct Categories
// @route     GET /api/v1/product/categories
// @access    Public
const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Product.distinct('category', {})
  if (!categories) {
    next(new ErrorResponse('Categories not found', 404))
  }
  res.status(200).json({
    success: true,
    data: categories,
  })
})

// @desc      ListSearch
// @route     GET /api/v1/product/search
// @access    Public
const productSearch = asyncHandler(async (req, res, next) => {
  // create query object to hold search value and category value
  const query = {}
  // assign search value to query.name
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' }
    // assigne category value to query.category
    if (req.query.category && req.query.category != 'All') {
      query.category = req.query.category
    }
    // find the product based on query object with 2 properties
    // search and category
    Product.find(query, (err, products) => {
      if (err) {
        return next(new ErrorResponse('Products not found', 404))
      }
      res.json({
        success: true,
        data: products,
      }) // send products as json response
    }).select('-photo')
  }
})

// @desc      List Products by Search
// @route     GET /api/v1/product/by/search
// @access    Public

const listBySearch = asyncHandler(async (req, res, next) => {
  let order = req.body.order ? req.body.order : 'desc'
  let sortBy = req.body.sortBy ? req.body.sortBy : '_id'
  let limit = req.body.limit ? parseInt(req.body.limit) : 100
  let skip = parseInt(req.body.skip)
  let findArgs = {}

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === 'price') {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        }
      } else {
        findArgs[key] = req.body.filters[key]
      }
    }
  }

  const products = await Product.find(findArgs)
    .select('-photo')
    .populate('category')
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec()
  if (!products) {
    next(new ErrorResponse('Products not found', 404))
  }
  res.status(200).json({
    success: true,
    data: products,
    length: products.length,
  })
})

export {
  createProduct,
  getProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
  productById,
  getRelatedProducts,
  getCategories,
  productSearch,
  listBySearch,
  getPhoto,
}
