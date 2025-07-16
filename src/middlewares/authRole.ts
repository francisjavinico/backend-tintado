import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "@src/errors/UnauthorizedError";

export function authRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("El usuario no está autenticado");
    }
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("Acceso denegado");
    }
    next();
  };
}
