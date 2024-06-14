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
import { Faculty } from '../faculty/faculty.model';
import { calculateGradeAndPoints } from './enrolledCourse.utils';

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
) => {
  const { semesterRegistration, offeredCourse, student, courseMarks } = payload;

  const isSemesterRegistrationExists =
    await SemesterRegistration.findById(semesterRegistration);
  if (!isSemesterRegistrationExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Semester registration not found !',
    );
  }

  const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);
  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered course not found !');
  }

  const isStudentExists = await Student.findById(student);
  if (!isStudentExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found !');
  }

  const faculty = await Faculty.findOne({ id: facultyId }, { _id: 1 });
  if (!faculty) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found !');
  }

  // check if the course belongs to the faculty in this semester
  const isCourseBelongToFaculty = await EnrolledCourse.findOne({
    semesterRegistration,
    offeredCourse,
    student,
    faculty: faculty._id,
  });
  if (!isCourseBelongToFaculty) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized faculty to update this course's mark! !",
    );
  }
  const modifiedData: Record<string, unknown> = { ...courseMarks }; // Destructured course mark object

  if (courseMarks?.finalTerm) {
    const { classTest1, classTest2, midTerm, finalTerm } =
      isCourseBelongToFaculty.courseMarks;

    console.log(isCourseBelongToFaculty.courseMarks);

    // we considered that classTest1 has 10%, midTerm has 30%, classTest2 has 10%, finalTerm has 50% in the totalMarks
    const totalMarks =
      Math.ceil(classTest1 * 0.1) +
      Math.ceil(midTerm * 0.3) +
      Math.ceil(classTest2 * 0.1) +
      Math.ceil(finalTerm * 0.5);

    console.log(totalMarks);

    const result = calculateGradeAndPoints(totalMarks);
    modifiedData.grade = result.grade;
    modifiedData.gradePoints = result.gradePoints;
    modifiedData.isCompleted = true;
  }
  if (courseMarks && Object.keys(courseMarks).length) {
    for (const [key, value] of Object.entries(courseMarks)) {
      modifiedData[`courseMarks.${key}`] = value;
    }
  }

  const result = await EnrolledCourse.findByIdAndUpdate(
    isCourseBelongToFaculty._id,
    modifiedData,
    { new: true },
  );

  return result;
};

export const EnrolledCourseServices = {
  createEnrolledCourseIntoDB,
  updateEnrolledCourseMarksIntoDB,
};
