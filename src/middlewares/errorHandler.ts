import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  error: Error | any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("[errorHandler] Error capturado:", error);
  const status = error.status || 500;
  res
    .status(status)
    .json({ error: error.message || "Error interno del servidor" });
};
