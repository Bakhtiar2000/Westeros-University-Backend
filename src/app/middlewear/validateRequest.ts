import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

// HOF is used so that we can pass parameter inside the middleware. Otherwise passing parameter was not possible
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({ body: req.body });
      return next();
    } catch (err) {
      next(err);
    }
  };
};
