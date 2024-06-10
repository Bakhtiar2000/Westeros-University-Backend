import { Schema, model } from 'mongoose';
import { TUser, UserModel } from './user.interface';
import config from '../../config';
import bcrypt from 'bcrypt';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
const userSchema = new Schema<TUser, UserModel>(
  {
    id: {
      type: String,
      required: [true, 'Id is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: 0, //Cannot find password through database find operation if select 0 applied
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
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

userSchema.statics.isUserExistsByCustomId = async function (id) {
  return await User.findOne({ id }).select('+password'); // As password field was set to select 0 in the model, we had to explicitly select this field here. '+password' means password and other fields as well
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  JWTIssuedTimestamp: number,
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000; //Conversion of date-time to millisecond as iat of jwtPayload also returns timestamp in millisecond
  return passwordChangedTime > JWTIssuedTimestamp;
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPass,
  hashPass,
) {
  return await bcrypt.compare(plainTextPass, hashPass);
};

export const User = model<TUser, UserModel>('User', userSchema);
