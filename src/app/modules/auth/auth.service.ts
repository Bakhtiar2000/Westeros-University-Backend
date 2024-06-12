import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import bcrypt from 'bcrypt';
import createToken from './auth.utils';
import { sendEmail } from '../../utils/sendEmail';

const loginUser = async (payload: TLoginUser) => {
  const user = await User.isUserExistsByCustomId(payload.id);

  // Check if user exists
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // Check if user is deleted
  const isUserDeleted = user?.isDeleted;
  if (isUserDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
  }

  // Check if user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
  }

  // Check if password is correct
  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password did not match!');
  }

  //----------------Create jsonwebtoken and send to the client-----------------
  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  //++++++++++++++++   ACCESS TOKEN   ++++++++++++++++
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  //++++++++++++++++   Refresh TOKEN   ++++++++++++++++
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );
  return {
    accessToken,
    refreshToken,
    needsPasswordChange: user.needsPasswordChange,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  const user = await User.isUserExistsByCustomId(userData.userId);

  // Check if user exists
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // Check if user is deleted
  const isUserDeleted = user?.isDeleted;
  if (isUserDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
  }

  // Check if user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
  }

  // Check if password is correct
  if (!(await User.isPasswordMatched(payload?.oldPassword, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password did not match!');
  }

  // Hash new password
  const newHashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      id: userData.userId,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(), // Stores the UTC date and time of password change operation
    },
  );

  return null; // No need to send password as response. That's why we did not assign update operation in result variable too
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string,
  ) as JwtPayload;

  const { userId, iat } = decoded;

  // checking if the user exists
  const user = await User.isUserExistsByCustomId(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  // Checking if password changed after token issued
  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !');
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

const forgetPassword = async (id: string) => {
  // checking if the user exists
  const user = await User.isUserExistsByCustomId(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );
  const resetUILink = `${config.reset_pass_ui_link}?id=${user.id}&token=${resetToken}`;
  sendEmail(user?.email, resetUILink);
  console.log(resetUILink);
};

const resetPassword = async (
  payload: { id: string; newPassword: string },
  token: string,
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByCustomId(payload.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string, // As we provide the access token in reset token link, we verify the access token, not refresh token
  ) as JwtPayload;

  if (payload.id !== decoded.userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Forbidden access: Unauthorized user',
    );
  }

  // Hash new password
  const newHashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      id: decoded.userId,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(), // Stores the UTC date and time of password change operation
    },
  );
};

export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
