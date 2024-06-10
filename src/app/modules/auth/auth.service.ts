import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';

const loginUser = async (payload: TLoginUser) => {
  // Check if user exists

  const user = await User.isUserExistsByCustomId(payload.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  //   // Check if user is deleted
  //   const isUserDeleted = isUserExists?.isDeleted;
  //   if (isUserDeleted) {
  //     throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
  //   }

  //   // Check if user is blocked
  //   const userStatus = isUserExists?.status;
  //   if (userStatus === 'blocked') {
  //     throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
  //   }

  // Check if password is correct
  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password did not match!');
  }
  return {};
};

export const AuthServices = {
  loginUser,
};
