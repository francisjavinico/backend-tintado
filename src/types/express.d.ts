import { Request } from "express";

declare global {
  namespace Express {
    interface User {
      id: number;
      name: string;
      email: string;
      role: string;
    }

    interface Request {
      user?: User;
    }
  }
}
