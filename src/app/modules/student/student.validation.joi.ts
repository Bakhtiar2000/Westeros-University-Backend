import Joi from 'joi';

const userNameValidationSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .max(15)
    .required()
    .pattern(/^[A-Za-z]+$/)
    .messages({
      'string.empty': 'First name is required',
      'string.max': 'First name cannot have more than 15 characters',
      'string.pattern.base': '{VALUE} is not valid last name',
    }),
  middleName: Joi.string().trim().max(15).messages({
    'string.max': 'Middle name cannot have more than 15 characters',
  }),
  lastName: Joi.string()
    .trim()
    .max(15)
    .required()
    .pattern(/^[A-Za-z]+$/)
    .messages({
      'string.empty': 'Last name is required',
      'string.max': 'Last name cannot have more than 15 characters',
      'string.pattern.base': '{VALUE} is not valid last name',
    }),
});

const guardianValidationSchema = Joi.object({
  fatherName: Joi.string().required().messages({
    'string.empty': 'Father name is required',
  }),
  fatherOccupation: Joi.string().required().messages({
    'string.empty': 'Father occupation is required',
  }),
  fatherContactNumber: Joi.string().required().messages({
    'string.empty': 'Father contact number is required',
  }),
  motherName: Joi.string().required().messages({
    'string.empty': 'Mother name is required',
  }),
  motherOccupation: Joi.string().required().messages({
    'string.empty': 'Mother occupation is required',
  }),
  motherContactNumber: Joi.string().required().messages({
    'string.empty': 'Mother contact number is required',
  }),
});

const localValidationGuardianSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Local guardian name is required',
  }),
  occupation: Joi.string().required().messages({
    'string.empty': 'Local guardian occupation is required',
  }),
  contactNo: Joi.string().required().messages({
    'string.empty': 'Local guardian contact number is required',
  }),
  address: Joi.string().required().messages({
    'string.empty': 'Local guardian address is required',
  }),
});

const studentValidationSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'ID is required',
  }),
  name: userNameValidationSchema.required().messages({
    'any.required': 'Name is required',
  }),
  gender: Joi.string().valid('male', 'female', 'other').required().messages({
    'any.only':
      "{#value} is not a valid gender. Gender can be one of the following: 'male', 'female', 'other'",
    'any.required': 'Gender is required',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': '{VALUE} is not a valid email',
  }),
  dateOfBirth: Joi.string(),
  contactNo: Joi.string().required().messages({
    'string.empty': 'Contact number is required',
  }),
  emergencyContactNo: Joi.string().required().messages({
    'string.empty': 'Emergency contact number is required',
  }),
  bloodGroup: Joi.string()
    .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    .messages({
      'any.only': '{VALUE} is not a valid blood group',
    }),
  presentAddress: Joi.string().required().messages({
    'string.empty': 'Present address is required',
  }),
  permanentAddress: Joi.string().required().messages({
    'string.empty': 'Permanent address is required',
  }),
  guardian: guardianValidationSchema.required().messages({
    'any.required': 'Guardian information is required',
  }),
  localGuardian: localValidationGuardianSchema.required().messages({
    'any.required': 'Local guardian information is required',
  }),
  profileImg: Joi.string().required().messages({
    'string.empty': 'Profile image is required',
  }),
  isActive: Joi.string().valid('active', 'blocked').default('active'),
});

export default studentValidationSchema;
