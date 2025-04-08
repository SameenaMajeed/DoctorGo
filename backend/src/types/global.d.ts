import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      data?: {
        id: string;
        role: string;
        email: string;
        userId?: string;
      };
    }
  }
}
