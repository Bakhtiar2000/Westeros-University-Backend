import { z } from 'zod';

const createAcademicSemesterValidationSchema = z.object({
  body: z.object({
    name: z.enum(['Spring', 'Summer', 'Fall']),
    code: z.enum(['01', '02', '03']),
    year: z.date(),
    startMonth: z.enum([
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
    ]),
    endMonth: z.enum([
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
    ]),
  }),
});

export const AcademicSemesterValidations = {
  createAcademicSemesterValidationSchema,
};
