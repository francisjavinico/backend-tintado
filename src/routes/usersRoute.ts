import {
  deleteUser,
  getUserId,
  getUsers,
  pushUser,
  putUser,
} from "@src/controllers/UsersController";
import { authRole } from "@src/middlewares/authRole";
import { authToken } from "@src/middlewares/authToken";
import { Router } from "express";

export const usersRoute = Router();

//Endpoint para obtener todos los usuarios
usersRoute.get("/", authToken, getUsers);

//Endpoint para obtener un usuario por su ID
usersRoute.get("/:id", authToken, getUserId);

//Endpoint para crear un usuario
usersRoute.post("/", authToken, pushUser);

//Endpoint para modificar un usuario por su ID
usersRoute.put("/:id", authToken, authRole("admin"), putUser);

//Endpoint para eliminar un usuario por su ID
usersRoute.delete("/:id", authToken, authRole("admin"), deleteUser);
