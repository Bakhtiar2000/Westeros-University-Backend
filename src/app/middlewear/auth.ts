import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import { catchAsync } from '../utils/catchAsync';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { TUserRole } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req, res, next) => {
    const token = req.headers.authorization;

    //Check if token is sent
    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Token not found: Unauthorized User!',
      );
    }

    const decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayload;
    const { userId, role } = decoded;
    const user = await User.isUserExistsByCustomId(userId);

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

    // Check if the was request sent by authorized user or not
    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Role mismatched. Unauthorized User!',
      );
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;
