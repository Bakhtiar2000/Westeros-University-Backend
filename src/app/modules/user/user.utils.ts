import { TAcademicSemester } from '../academicSemester/academicSemester.interface';
import { User } from './user.model';

const findLastStudentId = async () => {
  const lastStudent = await User.findOne({ role: 'student' }, { id: 1, _id: 0 })
    .sort({ createdAt: -1 }) // Finds the last student that has enrolled in the university
    .lean();

  return lastStudent?.id ? lastStudent?.id : undefined;
};

const generateStudentId = async (payload: TAcademicSemester) => {
  let currentId = (0).toString(); // 0000 by default
  const lastStudentId = await findLastStudentId();
  const lastStudentSemesterCode = lastStudentId?.substring(4, 6);
  const currentStudentSemesterCode = payload.code;
  const lastStudentYear = lastStudentId?.substring(0, 4);
  const currentStudentYear = payload.year;
  if (
    lastStudentId &&
    lastStudentSemesterCode === currentStudentSemesterCode &&
    lastStudentYear === currentStudentYear
  ) {
    currentId = lastStudentId.substring(6); // Takes last student id and cuts out first six digits to get the last four digit to be incremented
  }

  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0'); //padStart(4, '0') makes the string have 4 digits which is 0000 by default. If we write (4).toString().padStart(4, '0'), output= 0004. If we write (678).toString().padStart(4, '0'), output= 0678;
  incrementId = `${payload.year}${payload.code}${incrementId}`;
  return incrementId;
};

export default generateStudentId;
