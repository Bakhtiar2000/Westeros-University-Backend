// import studentValidationSchema from './student.validation.zod';
import { NextFunction, Request, Response } from 'express';
import { UserServices } from './user.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { password, student: studentData } = req.body;

    // Validating user data using joi
    // const { error, value } = studentValidationSchema.validate(studentData);

    // Validating user data using zod
    // const validatedData = studentValidationSchema.parse(studentData);

    // if (error) {
    //   res.status(500).json({
    //     success: false,
    //     message: 'Something went wrong',
    //     error: error.details,
    //   });
    // }

    // Putting the validated data in result
    const result = await UserServices.createStudentIntoDB(
      password,
      studentData,
    );

    //Send Response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Student is created successfully',
      data: result,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err) {
    next(err);
  }
};

export const UserControllers = {
  createStudent,
};
