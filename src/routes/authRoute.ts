import {
  forgotPassword,
  getProfile,
  loginUser,
  resetPassword,
  hasUsers,
  createFirstUser,
} from "@src/controllers/AuthController";
import { authToken } from "@src/middlewares/authToken";
import { Router } from "express";

const authRoute = Router();

// EndPoint para el login
authRoute.post("/login", loginUser);

// EndPoints para recuperar contraseña
authRoute.post("/forgot-password", forgotPassword);
authRoute.post("/reset-password", resetPassword);

// EndPoints para crear primer usuario y verificar existencia
authRoute.get("/has-users", hasUsers);
authRoute.post("/create-first-user", createFirstUser);

// EndPoint /me
authRoute.get("/me", authToken, getProfile);
export default authRoute;
