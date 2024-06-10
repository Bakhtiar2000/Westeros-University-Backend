/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application, Request, Response } from 'express'; // We don't get by default type declaration file from express. So we have to use npm i --save-dev @types/express to remove the error of declaration.
import cors from 'cors'; //Cors also requires a declaration file. We add it by giving command npm i --save-dev @types/cors
import globalErrorHandler from './app/middleWear/globalErrorHandler';
import notFound from './app/middleWear/notFound';
import router from './app/routes';
import cookieParser from 'cookie-parser';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ['http://localhost:5173'] }));

//Application
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  Promise.reject();
  res.send('Hello World!');
});

//Global error handler
app.use(globalErrorHandler);
//Not found
app.use(notFound);

//console.log(process.cwd());
export default app;
