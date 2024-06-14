import { TEnrolledCourse } from './enrolledCourse.interface';

const createEnrolledCourseIntoDB = async (
  id: string,
  payload: TEnrolledCourse,
) => {
  console.log(id, payload);
};

export const EnrolledCourseServices = {
  createEnrolledCourseIntoDB,
};
