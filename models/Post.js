const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required: [title, content, author]
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           example: "My Paris Adventure"
 *         content:
 *           type: string
 *           minLength: 10
 *           example: "The Eiffel Tower was amazing!"
 *         location:
 *           type: string
 *           example: "Paris, France"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             example: "travel"
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *             example: "https://example.com/image.jpg"
 *         author:
 *           type: string
 *           format: ObjectId
 *           example: "507f1f77bcf86cd799439011"
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 */

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: 10,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images) {
          return images.length <= 10;
        },
        message: 'Cannot have more than 10 images',
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      immutable: true,
    },

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: false,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
  }
});

module.exports = mongoose.model('Post', PostSchema);
