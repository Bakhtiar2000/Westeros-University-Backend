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
import { hasTimeConflict } from './offeredCourse.utils';

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

  //--------------------Get the schedules of the faculties that have classes in the same days (Time/ day conflict) in payload data---------------------------
  const existingSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days }, // filtering existing schedules of a faculty in a semester for only the days requested in the payload
  }).select('days startTime endTime'); // Shaping as TSchedule interface

  const requestedSchedule = { days, startTime, endTime }; // From payload (Shaping as TSchedule interface)

  const conflictStatus = hasTimeConflict(existingSchedules, requestedSchedule);
  if (conflictStatus) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Faculty ${isFacultyExists.name.firstName} ${isFacultyExists.name.middleName} ${isFacultyExists.name.lastName} is not available at the requested time/ day!`,
    );
  }

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
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
  }
  return result;
};

const updateOfferedCourseIntoDB = async (
  id: string,
  payload: Pick<TOfferedCourse, 'faculty' | 'days' | 'startTime' | 'endTime'>, // Not partial but pick used as we must have these fields in update request
) => {
  const { faculty, days, startTime, endTime } = payload;

  const isOfferedCourseExists = await OfferedCourse.findById(id);
  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found !');
  }

  const isFacultyExists = await Faculty.findById(faculty);
  if (!isFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found !');
  }

  //------------------Checking the status of the semester registration-----------------
  const semesterRegistrationData = await SemesterRegistration.findById(
    isOfferedCourseExists.semesterRegistration,
  );

  if (semesterRegistrationData?.status !== 'UPCOMING') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can not update this offered course as it is in ${semesterRegistrationData?.status} status`,
    );
  }

  //---------------------Check Time/ day conflict-----------------------
  const semesterRegistration = isOfferedCourseExists.semesterRegistration;

  const existingSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
  }).select('days startTime endTime');

  const requestedSchedule = { days, startTime, endTime };

  const conflictStatus = hasTimeConflict(existingSchedules, requestedSchedule);
  if (conflictStatus) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Faculty ${isFacultyExists.name.firstName} ${isFacultyExists.name.middleName} ${isFacultyExists.name.lastName} is not available at the requested time/ day!`,
    );
  }

  const result = await OfferedCourse.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteOfferedCourseFromDB = async (id: string) => {
  const isOfferedCourseExists = await OfferedCourse.findById(id);
  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
  }

  const semesterRegistrationData = await SemesterRegistration.findById(
    isOfferedCourseExists.semesterRegistration,
  );
  if (semesterRegistrationData?.status !== 'UPCOMING') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can not update this offered course as it is in ${semesterRegistrationData?.status} status`,
    );
  }

  const result = await OfferedCourse.findByIdAndDelete(id);

  return result;
};

export const OfferedCourseServices = {
  createOfferedCourseIntoDB,
  getAllOfferedCoursesFromDB,
  getSingleOfferedCourseFromDB,
  updateOfferedCourseIntoDB,
  deleteOfferedCourseFromDB,
};
