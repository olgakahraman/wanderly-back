const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required: [email, username]
 *       properties:
 *         _id:
 *           type: string
 *           example: "68adc81446ede3457d8143a1"
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         username:
 *           type: string
 *           example: traveler_olga
 *         bio:
 *           type: string
 *           example: "Love mountains and coffee ☕️"
 *         hasAvatar:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 */

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
      trim: true,
    },
    avatarBuffer: { type: Buffer, select: false },
    avatarMime: { type: String, default: null, select: false },
    hasAvatar: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
