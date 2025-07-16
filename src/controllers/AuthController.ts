import { UnauthorizedError } from "@src/errors/UnauthorizedError";
import {
  forgotPasswordService,
  getProfileService,
  loginService,
  resetPasswordService,
  createFirstUserService,
  hasUsersService,
} from "@src/services/authService";
import { Request, Response, NextFunction } from "express";

export const loginUser = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const result = await loginService(req.body);
  resp.status(200).json(result);
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  const result = await forgotPasswordService(email);
  res.json({
    message:
      "Si el correo existe, se enviara un enlace al correo electronico para cambiar su contraseña",
  });
};

export const resetPassword = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const { token, password } = req.body;
  const result = await resetPasswordService(token, password);
  resp.status(200).json({ message: "Contraseña actualizada correctamente" });
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const user = await getProfileService(Number(req.user?.id));
  if (!userId) {
    throw new UnauthorizedError("Usuario no autorizado");
    return;
  }
  res.status(200).json(user);
};

export const hasUsers = async (req: Request, res: Response) => {
  const exists = await hasUsersService();
  res.json({ exists });
};

export const createFirstUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    const user = await createFirstUserService({ name, email, password });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};
