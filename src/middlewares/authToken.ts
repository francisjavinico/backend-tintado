import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header("authorization");
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Token no proporcionado" });
    return;
  }
  try {
    const secret = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, secret);
    req.user = payload as {
      id: number;
      name: string;
      email: string;
      role: string;
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado" });
    return;
  }
}
