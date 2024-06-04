import { Schema, model } from 'mongoose';
import { TUser } from './user.interface';
import config from '../../config';
import bcrypt from 'bcrypt';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
const userSchema = new Schema<TUser>(
  {
    id: {
      type: String,
      required: [true, 'Id is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['admin', 'student', 'faculty'],
    },
    status: {
      type: String,
      enum: ['in-progress', 'blocked'],
      default: 'in-progress',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds created at and updated at automatically
  },
);

// -----------------Document (save / remove) Middleware / hook (Pre + Post)-------------------
userSchema.pre('save', async function (next) {
  // Hashing password before saving
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  this.password = await bcrypt.hash(
    this.password, //this= current user document
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

userSchema.post('save', function (doc, next) {
  //Posting password empty in database
  doc.password = '';
  next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
  const query = this.getQuery();
  const isUserExists = await User.findOne(query);
  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'This User does not exist!');
  }
  next();
});

export const User = model<TUser>('User', userSchema);
