import {
  createUserService,
  deleteUserService,
  getUserIdService,
  getUsersServices,
  updateUserService,
} from "@src/services/userService";
import { Request, Response } from "express";

// Obtener Todos los Usuarios
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const users = await getUsersServices();
  res.json(users);
};

//Obtener Usuario por su ID
export const getUserId = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const user = await getUserIdService(id);
  res.json(user);
};

//Crear un usuario
export const pushUser = async (req: Request, res: Response): Promise<void> => {
  const newUser = await createUserService(req.body);
  res.status(201).json(newUser);
};

//Modificar un usuario por su id
export const putUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = req.body;
  const updatedUser = await updateUserService(Number(id), data);
  res.status(200).json(updatedUser);
};

// Eliminar usuario por su Id
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = Number(req.params.id);
  const deletedUser = await deleteUserService(id);
  res.status(200).json(deletedUser);
};
