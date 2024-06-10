import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TOfferedCourse } from './offeredCourse.interface';
import { OfferedCourse } from './offeredCourse.model';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';
import { AcademicFaculty } from '../academicFaculty/academicFaculty.model';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { Course } from '../course/course.model';
import { Faculty } from '../faculty/faculty.model';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createOfferedCourseIntoDB = async (payload: TOfferedCourse) => {
  const {
    semesterRegistration,
    academicFaculty,
    academicDepartment,
    course,
    faculty,
    section,
    days,
    startTime,
    endTime,
  } = payload;

  const isSemesterRegistrationExists =
    await SemesterRegistration.findById(semesterRegistration);
  if (!isSemesterRegistrationExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Semester Registration not found !',
    );
  }

  // Academic semester will not come from front-end data (payload), It will be retrieved from semester registration
  const academicSemester = isSemesterRegistrationExists.academicSemester;

  const isAcademicFacultyExists =
    await AcademicFaculty.findById(academicFaculty);
  if (!isAcademicFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic Faculty not found !');
  }

  const isAcademicDepartmentExists =
    await AcademicDepartment.findById(academicDepartment);
  if (!isAcademicDepartmentExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic Department not found !');
  }

  const isCourseExists = await Course.findById(course);
  if (!isCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course not found !');
  }

  const isFacultyExists = await Faculty.findById(faculty);
  if (!isFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found !');
  }

  //----------------------Check if the department belongs to the faculty-----------------------------
  const isDepartmentBelongToFaculty = await AcademicDepartment.findOne({
    _id: academicDepartment,
    academicFaculty,
  });
  if (!isDepartmentBelongToFaculty) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `${isAcademicDepartmentExists.name} does not belong to ${isAcademicFacultyExists.name}`,
    );
  }

  //---------------------Check if the requested course with same section already offered in given semester--------------------------
  const isOfferedCourseExistsWithSameSectionInThisSemesterRegistration =
    await OfferedCourse.findOne({
      semesterRegistration,
      course,
      section,
    });
  const findAcademicSemester =
    await AcademicSemester.findById(academicSemester);
  if (isOfferedCourseExistsWithSameSectionInThisSemesterRegistration) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `${isCourseExists.title} course with same section is already offered in the semester ${findAcademicSemester && findAcademicSemester.name} ${findAcademicSemester && findAcademicSemester.year}`,
    );
  }

  //--------------------Get the schedules of the faculties that have classes in the same days in payload data---------------------------
  const existingSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days }, // filtering existing schedules of a faculty in a semester for only the days requested in the payload
  }).select('days startTime endTime');

  const requestedSchedule = { days, startTime, endTime }; // From payload

  existingSchedules.forEach((schedule) => {
    const existingStartTime = new Date(`1970-01-01T${schedule.startTime}`);
    const existingEndTime = new Date(`1970-01-01T${schedule.endTime}`);
    const requestedStartTime = new Date(
      `1970-01-01T${requestedSchedule.startTime}`,
    );
    const requestedEndTime = new Date(
      `1970-01-01T${requestedSchedule.endTime}`,
    );

    //Let's Consider:
    // existingTime: 11.30 - 12.30 ---- requestedTime: 11.00 - 12.00 [Conflict]
    // existingTime: 09.30 - 10.30 ---- requestedTime: 11.00 - 12.00 [No Conflict]

    if (
      requestedStartTime < existingEndTime &&
      requestedEndTime > existingStartTime
    ) {
      throw new AppError(
        httpStatus.CONFLICT,
        `Faculty ${isFacultyExists.name.firstName} ${isFacultyExists.name.middleName} ${isFacultyExists.name.lastName} is not available at the requested time/ day!`,
      );
    }
  });

  const result = await OfferedCourse.create({ ...payload, academicSemester });
  return result;
};

const getAllOfferedCoursesFromDB = async (query: Record<string, unknown>) => {
  const offeredCourseQuery = new QueryBuilder(
    OfferedCourse.find()
      .populate('academicFaculty')
      .populate('academicDepartment'),
    query,
  )
    .filter()
    .paginate()
    .sort()
    .fields();
  const result = await offeredCourseQuery.modelQuery;
  return result;
};

const getSingleOfferedCourseFromDB = async (id: string) => {
  const result = await OfferedCourse.findById(id);
  return result;
};

const updateOfferedCourseIntoDB = async (
  id: string,
  payload: Partial<TOfferedCourse>,
) => {
  console.log(id, payload);
};

export const OfferedCourseServices = {
  createOfferedCourseIntoDB,
  getAllOfferedCoursesFromDB,
  getSingleOfferedCourseFromDB,
  updateOfferedCourseIntoDB,
};
