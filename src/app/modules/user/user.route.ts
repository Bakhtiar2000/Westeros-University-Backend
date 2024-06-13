import express, { NextFunction, Request, Response } from 'express';
import { UserControllers } from './user.controller';
import { studentValidations } from '../student/student.validation';
import { validateRequest } from '../../middleWear/validateRequest';
import { createFacultyValidationSchema } from '../faculty/faculty.validation';
import { createAdminValidationSchema } from '../admin/admin.validation';
import auth from '../../middleWear/auth';
import USER_ROLE from './user.constant';
import { UserValidation } from './user.validation';
import { upload } from '../../utils/sendImageToCloudinary';

const router = express.Router();

//Will call controller function
router.post(
  '/create-student',
  auth(USER_ROLE.admin),
  upload.single('file'), // This middleware parse the document in form data format
  (req: Request, res: Response, next: NextFunction) => {
    //We need JSON data to move on to the next middleware. That's why, we have to use this extra middleware to make req.body to be in json format like before
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(studentValidations.createStudentValidationSchema),
  UserControllers.createStudent,
);

router.post(
  '/create-faculty',
  auth(USER_ROLE.admin),
  validateRequest(createFacultyValidationSchema),
  UserControllers.createFaculty,
);

router.post(
  '/create-admin',
  auth(USER_ROLE.admin),
  validateRequest(createAdminValidationSchema),
  UserControllers.createAdmin,
);

router.post(
  '/change-status/:id',
  auth(USER_ROLE.admin),
  validateRequest(UserValidation.changeStatusValidationSchema),
  UserControllers.changeStatus,
);

// me route for getting personal data securely
router.get(
  '/me',
  auth(USER_ROLE.student, USER_ROLE.faculty, USER_ROLE.admin),
  UserControllers.getMe,
);

export const UserRoutes = router;
