import { z } from 'zod';

export const createSemesterRegistrationSchema = z.object({
  body: z.object({}),
});

export const updateSemesterRegistrationSchema = z.object({
  body: z.object({}),
});

export const SemesterRegistrationValidations = {
  createSemesterRegistrationSchema,
  updateSemesterRegistrationSchema,
};
