import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import { catchAsync } from '../utils/catchAsync';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';

// interface CustomRequest extends Request{
//     user: JwtPayload
// }

const auth = () => {
  return catchAsync(async (req, res, next) => {
    const token = req.headers.authorization;

    //Check if token is sent
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized User!');
    }

    //Check if token is valid
    jwt.verify(
      token,
      config.jwt_access_secret as string,
      function (err, decoded) {
        if (err) {
          throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized User!');
        }
        req.user = decoded as JwtPayload;
        next();
      },
    );
  });
};

export default auth;
