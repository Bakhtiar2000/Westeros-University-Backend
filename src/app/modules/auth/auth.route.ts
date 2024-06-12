import express from 'express';
import { validateRequest } from '../../middleWear/validateRequest';
import { AuthValidation } from './auth.validation';
import { AuthControllers } from './auth.controller';
import auth from '../../middleWear/auth';
import USER_ROLE from '../user/user.constant';

const router = express.Router();

// Do not use auth guard in this route as token will be created after these routes run. So, we cannot validate before
router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.loginUser,
);

router.post(
  '/change-password',
  auth(USER_ROLE.student, USER_ROLE.faculty, USER_ROLE.admin),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthControllers.changePassword,
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthControllers.refreshToken,
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword,
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthControllers.resetPassword,
);

export const AuthRoutes = router;
