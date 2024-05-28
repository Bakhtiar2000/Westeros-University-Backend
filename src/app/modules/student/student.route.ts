import express from 'express';
import { StudentControllers } from './student.controller';

const router = express.Router();

//Will call controller function
router.post('/create-student', StudentControllers.createStudent);
router.get('/', StudentControllers.getAllStudents);
router.get('/:id', StudentControllers.getSingleStudent);

console.log('Hello');

export const StudentRoutes = router;
