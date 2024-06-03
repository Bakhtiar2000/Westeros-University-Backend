import {
  TAcademicSemester,
  TAcademicSemesterNameCodeMapper,
} from './academicSemester.interface';
import { AcademicSemester } from './academicSemester.model';

const createAcademicSemesterIntoDB = async (payload: TAcademicSemester) => {
  const academicSemesterNameCodeMapper: TAcademicSemesterNameCodeMapper = {
    Spring: '01',
    Summer: '02',
    Fall: '03',
  };

  if (academicSemesterNameCodeMapper[payload.name] !== payload.code) {
    throw Error('Invalid Semester Code');
  }
  const result = await AcademicSemester.create(payload);
  return result;
};

export const AcademicSemesterServices = {
  createAcademicSemesterIntoDB,
};
