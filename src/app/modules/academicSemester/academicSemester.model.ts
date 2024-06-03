import { Schema, model } from 'mongoose';
import { TAcademicSemester, TMonths } from './academicSemester.interface';

const months: TMonths[] = [
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
      type: Date,
      required: [true, 'Year is required'],
    },
    startMonth: {
      type: String,
      enum: months,
      required: [true, 'Start Month is required'],
    },
    endMonth: {
      type: String,
      enum: months,
      required: [true, 'End Month is required'],
    },
  },
  {
    timestamps: true,
  },
);

export const AcademicSemester = model<TAcademicSemester>(
  'User',
  academicSemesterSchema,
);
