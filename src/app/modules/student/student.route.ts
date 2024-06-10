import express from 'express';
import { StudentControllers } from './student.controller';
import { validateRequest } from '../../middleWear/validateRequest';
import { studentValidations } from './student.validation';
import auth from '../../middleWear/auth';

const router = express.Router();
//Will call controller function
router.get('/', auth(), StudentControllers.getAllStudents);

router.get('/:id', StudentControllers.getSingleStudent);

router.patch(
  '/:id',
  validateRequest(studentValidations.updateStudentValidationSchema),
  StudentControllers.updateStudent,
);

router.delete('/:id', StudentControllers.deleteStudent);

export const StudentRoutes = router;
