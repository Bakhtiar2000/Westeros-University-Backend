import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { EnrolledCourseServices } from './enrolledCourse.service';
import { catchAsync } from '../../utils/catchAsync';

const createEnrolledCourse = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await EnrolledCourseServices.createEnrolledCourseIntoDB(
    userId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course is enrolled for student successfully',
    data: result,
  });
});

export const EnrolledCourseControllers = {
  createEnrolledCourse,
};
