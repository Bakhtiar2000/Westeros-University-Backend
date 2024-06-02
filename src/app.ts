/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application, Request, Response } from 'express'; // We don't get by default type declaration file from express. So we have to use npm i --save-dev @types/express to remove the error of declaration.
import cors from 'cors'; //Cors also requires a declaration file. We add it by giving command npm i --save-dev @types/cors
import { StudentRoutes } from './app/modules/student/student.route';
import { UserRoutes } from './app/modules/user/user.route';
import globalErrorHandler from './app/middlewear/globalErrorHandler';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cors());

//Application
app.use('/api/v1/students', StudentRoutes);
app.use('/api/v1/users', UserRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

//Global error handler
app.use(globalErrorHandler);
//Not found
app.use();

//console.log(process.cwd());
export default app;
