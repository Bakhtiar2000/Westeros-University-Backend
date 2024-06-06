import mongoose from 'mongoose';
import { Student } from './student.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { User } from '../user/user.model';
import { TStudent } from './student.interface';
import QueryBuilder from '../../builder/queryBuilder';

const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
  // // Record<string, unknown> means query can be any object where the keys are strings and the values are of any type.
  // const queryObj = { ...query }; // copying query

  // let searchTerm = '';
  // if (query?.searchTerm) {
  //   searchTerm = query?.searchTerm as string;
  // }

  // //-------------------Searching---------------------
  // const studentSearchableFields = ['email', 'name.firstName', 'presentAddress'];
  // const searchQuery = Student.find({
  //   // Partial match find() operation
  //   $or: studentSearchableFields.map((field) => ({
  //     [field]: { $regex: searchTerm, $options: 'i' }, // option 'i' makes the search case-insensitive.
  //   })),
  // });

  // //-------------------Filtering---------------------
  // const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
  // excludeFields.forEach((elem) => delete queryObj[elem]); // deletes searchTerm (which is to be partial match) from the query and saves the other queries (exact match queries) like email
  // console.log({ query }, { queryObj });
  // const filterQuery = searchQuery
  //   .find(queryObj) // Exact match find() operation
  //   .populate('admissionSemester')
  //   .populate({
  //     path: 'academicDepartment',
  //     populate: {
  //       path: 'academicFaculty', // Inside academic department. We can see the details of academic faculty
  //     },
  //   });

  // //-------------------Sorting---------------------
  // let sortField = '-createdAt'; // Add sort in excludeFields as well
  // if (query.sort) {
  //   sortField = query.sort as string;
  // }
  // const sortQuery = filterQuery.sort(sortField);

  // //-------------------Paginating and Limiting---------------------
  // let page = 1;
  // let limit = 1; // Add limit in excludeFields as well
  // let skip = 0;
  // if (query.limit) {
  //   limit = Number(query.limit);
  // }
  // if (query.page) {
  //   page = Number(query.page);
  //   skip = (page - 1) * limit;
  // }
  // const paginateQuery = sortQuery.skip(skip);
  // const limitQuery = paginateQuery.limit(limit);

  // //-------------------Field Limiting---------------------
  // let fields = '-__v';
  // if (query.fields) {
  //   fields = (query.fields as string).split(',').join(' ');
  // }
  // const fieldQuery = await limitQuery.select(fields); // Await should be in the last query (which is to be returned) of the filtering chaining
  // return fieldQuery;

  const studentSearchableFields = ['email', 'name.firstName', 'presentAddress'];
  const studentQuery = new QueryBuilder(
    Student.find()
      .populate('admissionSemester')
      .populate({
        path: 'academicDepartment',
        populate: {
          path: 'academicFaculty', // Inside academic department. We can see the details of academic faculty
        },
      }),
    query,
  )
    .search(studentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await studentQuery.modelQuery;
  return result;
};

const getSingleStudentFromDB = async (id: string) => {
  const result = await Student.findOne({ id: id })
    .populate('admissionSemester')
    .populate({
      path: 'academicDepartment',
      populate: {
        path: 'academicFaculty',
      },
    });
  return result;
};

const deleteStudentFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // delete student session
    const deletedStudent = await Student.findOneAndUpdate(
      { id: id },
      { isDeleted: true },
      { new: true, session },
    );
    if (!deletedStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete Student');
    }

    // delete user session
    const deletedUser = await User.findOneAndUpdate(
      { id: id },
      { isDeleted: true },
      { new: true, session },
    );
    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete User');
    }

    //Commit and end session
    await session.commitTransaction();
    await session.endSession();

    return deletedStudent;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete Student');
  }
};

const updateStudentIntoDB = async (id: string, payload: Partial<TStudent>) => {
  const { name, guardian, localGuardian, ...remainingStudentData } = payload;
  const modifiedUpdated: Record<string, unknown> = {
    ...remainingStudentData,
  };

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdated[`name.${key}`] = value;
    }
  }

  if (guardian && Object.keys(guardian).length) {
    for (const [key, value] of Object.entries(guardian)) {
      modifiedUpdated[`guardian.${key}`] = value;
    }
  }

  if (localGuardian && Object.keys(localGuardian).length) {
    for (const [key, value] of Object.entries(localGuardian)) {
      modifiedUpdated[`localGuardian.${key}`] = value;
    }
  }

  console.log(modifiedUpdated);
  const result = await Student.findOneAndUpdate({ id: id }, modifiedUpdated, {
    new: true,
    runValidators: true,
  });
  return result;
};

export const StudentServices = {
  getAllStudentsFromDB,
  getSingleStudentFromDB,
  deleteStudentFromDB,
  updateStudentIntoDB,
};
