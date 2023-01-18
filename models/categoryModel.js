import mongoose from 'mongoose'
import slugify from 'slugify'
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      unique: true,
    },
    slug: String,
  },
  {
    timestamps: true,
  }
)

//slugify
categorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

const Category = mongoose.model('Category', categorySchema)
export default Category
