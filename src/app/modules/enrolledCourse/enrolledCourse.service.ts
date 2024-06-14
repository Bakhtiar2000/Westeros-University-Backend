/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TEnrolledCourse } from './enrolledCourse.interface';
import { Student } from '../student/student.model';
import { OfferedCourse } from '../offeredCourse/offeredCourse.model';
import EnrolledCourse from './enrolledCourse.model';
import mongoose from 'mongoose';
import { Course } from '../course/course.model';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';

const createEnrolledCourseIntoDB = async (
  userId: string,
  payload: TEnrolledCourse,
) => {
  const { offeredCourse } = payload;

  // Check if the offered course exists in database
  const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);
  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered course not found !');
  }

  // Check if there is capacity for student in this course
  if (isOfferedCourseExists.maxCapacity <= 0) {
    throw new AppError(httpStatus.BAD_GATEWAY, 'Room is full !');
  }

  // Check if the student is already enrolled in the course
  const student = await Student.findOne({ id: userId }, { _id: 1 });
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found !');
  }
  const isStudentAlreadyEnrolled = await EnrolledCourse.findOne({
    semesterRegistration: isOfferedCourseExists?.semesterRegistration,
    offeredCourse,
    student: student._id,
  });
  if (isStudentAlreadyEnrolled) {
    throw new AppError(httpStatus.CONFLICT, 'Student is already enrolled !');
  }

  // Check total credit exceeds max credit available for the semester
  const enrolledCourses = await EnrolledCourse.aggregate([
    // Stage-1: retrieving a student's all the enrolled courses in a semester
    {
      $match: {
        semesterRegistration: isOfferedCourseExists?.semesterRegistration,
        student: student?._id,
      },
    },
    // Stage-2: embedding course information
    {
      $lookup: {
        from: 'courses', // lookup from courses collection to enrolledCourses collection
        localField: 'course', // the field in enrolledCourses collection
        foreignField: '_id', // the field in courses collection
        as: 'enrolledCourseData', // will be saved as enrolledCourseData in enrolledCourses collection
      },
    },
    // Stage-3: breaks down enrolledCourseData array into one or several objects
    {
      $unwind: '$enrolledCourseData',
    },
    // Stage-4: Merge documents and retrieve only the necessary data like _id, totalEnrolledCredits
    {
      $group: {
        _id: null,
        totalEnrolledCredits: { $sum: '$enrolledCourseData.credits' },
      },
    },
  ]);

  const totalCredits =
    enrolledCourses.length > 0 ? enrolledCourses[0].totalEnrolledCredits : 0;

  const course = await Course.findById(isOfferedCourseExists.course);
  const currentCredit = course?.credits;

  const semesterRegistration = await SemesterRegistration.findById(
    isOfferedCourseExists.semesterRegistration,
  ).select('maxCredit');
  const maxCredit = semesterRegistration?.maxCredit;

  if (totalCredits && maxCredit && totalCredits + currentCredit > maxCredit) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have exceeded maximum number of credits for this semester!',
    );
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Transaction -1: create an enrolledCourse in DB
    const result = await EnrolledCourse.create(
      [
        {
          semesterRegistration: isOfferedCourseExists.semesterRegistration,
          academicSemester: isOfferedCourseExists.academicSemester,
          academicFaculty: isOfferedCourseExists.academicFaculty,
          academicDepartment: isOfferedCourseExists.academicDepartment,
          offeredCourse: offeredCourse,
          course: isOfferedCourseExists.course,
          student: student._id,
          faculty: isOfferedCourseExists.faculty,
          isEnrolled: true,
        },
      ], // Inside transaction rollback, we take the data inside an array, not as Object
      { session },
    );

    if (!result) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to enroll in this course !',
      );
    }

    // Transaction -2: reduce maxCapacity of offeredCourse
    const maxCapacity = isOfferedCourseExists.maxCapacity;
    await OfferedCourse.findByIdAndUpdate(offeredCourse, {
      maxCapacity: maxCapacity - 1,
    });

    await session.commitTransaction();
    await session.endSession();
    return result;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

const updateEnrolledCourseMarksIntoDB = async (
  facultyId: string,
  payload: Partial<TEnrolledCourse>,
) => {};

export const EnrolledCourseServices = {
  createEnrolledCourseIntoDB,
  updateEnrolledCourseMarksIntoDB,
};
