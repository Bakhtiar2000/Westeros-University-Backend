import { Schema, model } from 'mongoose';
import { TAcademicSemester, TMonths } from './academicSemester.interface';
import AppError from '../../errors/AppError';

const Months: TMonths[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const academicSemesterSchema = new Schema<TAcademicSemester>(
  {
    name: {
      type: String,
      enum: ['Spring', 'Summer', 'Fall'],
      required: [true, 'Name is required'],
    },
    code: {
      type: String,
      enum: ['01', '02', '03'],
      required: [true, 'Code is required'],
    },
    year: {
      type: String,
      required: [true, 'Year is required'],
    },
    startMonth: {
      type: String,
      enum: Months,
      required: [true, 'Start Month is required'],
    },
    endMonth: {
      type: String,
      enum: Months,
      required: [true, 'End Month is required'],
    },
  },
  {
    timestamps: true,
  },
);

academicSemesterSchema.pre('save', async function (next) {
  const isSemesterExists = await AcademicSemester.findOne({
    year: this.year,
    name: this.name,
  });
  if (isSemesterExists) {
    throw new AppError(409, 'Semester already Exists!');
  }
  next();
});

export const AcademicSemester = model<TAcademicSemester>(
  'AcademicSemester',
  academicSemesterSchema,
);
