/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

export interface TUser {
  // As we are extending it, it is declared as interface instead of type
  id: string;
  password: string;
  needsPasswordChange: boolean;
  role: 'admin' | 'student' | 'faculty';
  status: 'in-progress' | 'blocked';
  isDeleted: boolean;
}

export interface UserModel extends Model<TUser> {
  isUserExistsByCustomId(id: string): Promise<TUser>;
  isPasswordMatched(plainTextPass: string, hashPass: string): Promise<boolean>;
}
