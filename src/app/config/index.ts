import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') }); //process.cwd() returns thr current working directory which is F:\Projects_03\first-project. If we add .env after that, it gets the access of .env file in this path. The join function is default, not installed.

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  default_pass: process.env.DEFAULT_PASS,
  node_env: process.env.NODE_ENV,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
}; //This file is created basically for managing the process.env data. All other folders get access to env data from this config folder.
