import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

// Inserting the property user inside Request interface of Express globally. This property will provide jwt payload data
