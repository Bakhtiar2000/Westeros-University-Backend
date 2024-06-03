import { z } from 'zod';

const userNameValidationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .max(15, 'First name cannot have more than 15 characters'),
  middleName: z
    .string()
    .trim()
    .max(15, 'Middle name cannot have more than 15 characters'),
  lastName: z
    .string()
    .trim()
    .max(15, 'Last name cannot have more than 15 characters'),
});

const guardianValidationSchema = z.object({
  fatherName: z.string(),
  fatherOccupation: z.string(),
  fatherContactNumber: z.string(),
  motherName: z.string(),
  motherOccupation: z.string(),
  motherContactNumber: z.string(),
});

const localGuardianValidationSchema = z.object({
  name: z.string(),
  occupation: z.string(),
  contactNo: z.string(),
  address: z.string(),
});

const createStudentValidationSchema = z.object({
  body: z.object({
    password: z.string().max(20),
    student: z.object({
      name: userNameValidationSchema,
      gender: z.enum(['male', 'female', 'other']),
      email: z.string().email('Invalid email format'),
      dateOfBirth: z.string().optional(),
      contactNo: z.string(),
      emergencyContactNo: z.string(),
      bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
      presentAddress: z.string(),
      permanentAddress: z.string(),
      guardian: guardianValidationSchema,
      localGuardian: localGuardianValidationSchema,
      admissionSemester: z.string(),
      profileImg: z.string(),
    }),
  }),
});

export const studentValidations = {
  createStudentValidationSchema,
};
