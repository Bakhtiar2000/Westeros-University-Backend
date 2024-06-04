import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../errors/AppError';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import generateStudentId from './user.utils';
import mongoose from 'mongoose';

const createStudentIntoDB = async (password: string, payload: TStudent) => {
  const userData: Partial<TUser> = {};
  userData.password = password || (config.default_pass as string);
  userData.role = 'student';

  const admissionSemester = await AcademicSemester.findById(
    payload.admissionSemester,
  );
  if (!admissionSemester) {
    throw new AppError(httpStatus.NOT_FOUND, 'Admission semester not found');
  }

  // Started Transaction rollback for data consistency between user and student databases
  const session = await mongoose.startSession();
  try {
    //---------------Transaction Starts----------------
    session.startTransaction();
    userData.id = await generateStudentId(admissionSemester); // As generateStudentId is an asynchronous function (in is written in async), we use await here

    //---------------Transaction-1 : Create a User----------------
    const newUser = await User.create([userData], { session }); // Inside transaction rollback, we take the data inside an array, not as Object
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create User');
    }
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; // reference id

    //---------------Transaction-2 : Create a Student----------------
    const newStudent = await Student.create([payload], { session });
    if (!newStudent.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create Student');
    }
    //---------------Transaction Committed/ Saved to database permanently----------------
    await session.commitTransaction(); // As all our error checking is done until this point, we commit here

    //---------------Transaction Ends--------------------
    await session.endSession();
    return newStudent;
  } catch (err) {
    //---------------Whole Transaction gets aborted if any error found--------------------
    await session.abortTransaction();
    await session.endSession();
  }
};

export const UserServices = {
  createStudentIntoDB,
};
