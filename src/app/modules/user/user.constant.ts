const USER_ROLE = {
  student: 'student',
  faculty: 'faculty',
  admin: 'admin',
  superAdmin: 'superAdmin',
} as const; // So that no one can modify or write on this object

export default USER_ROLE;
