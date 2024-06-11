import express from 'express';
import { CourseControllers } from './course.controller';
import { CourseValidations } from './course.validation';
import { validateRequest } from '../../middleWear/validateRequest';
import auth from '../../middleWear/auth';
import USER_ROLE from '../user/user.constant';

const router = express.Router();

router.post(
  '/create-course',
  auth(USER_ROLE.admin),
  validateRequest(CourseValidations.createCourseValidationSchema),
  CourseControllers.createCourse,
);

router.get(
  '/',
  auth(USER_ROLE.student, USER_ROLE.faculty, USER_ROLE.admin),
  CourseControllers.getAllCourses,
);

router.get(
  '/:id',
  auth(USER_ROLE.student, USER_ROLE.faculty, USER_ROLE.admin),
  CourseControllers.getSingleCourse,
);

router.patch(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(CourseValidations.updateCourseValidationSchema),
  CourseControllers.updateCourse,
);

router.delete('/:id', auth(USER_ROLE.admin), CourseControllers.deleteCourse);

router.put(
  '/:courseId/assign-faculties',
  auth(USER_ROLE.admin),
  validateRequest(CourseValidations.facultiesWithCourseValidationSchema),
  CourseControllers.assignFacultiesWithCourse,
);

router.delete(
  '/:courseId/remove-faculties',
  auth(USER_ROLE.admin),
  validateRequest(CourseValidations.facultiesWithCourseValidationSchema),
  CourseControllers.removeFacultiesFromCourse,
);

export const CourseRoutes = router;
