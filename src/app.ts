import express, { Application, Request, Response } from 'express'; // We don't get by default type declaration file from express. So we have to use npm i --save-dev @types/express to remove the error of declaration.
import cors from 'cors'; //Cors also requires a declaration file. We add it by giving command npm i --save-dev @types/cors

const app: Application = express();

//parsers
app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

//console.log(process.cwd());
export default app;
