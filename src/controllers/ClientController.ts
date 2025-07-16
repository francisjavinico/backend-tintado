import {
  createClientService,
  deleteClientService,
  getClientIdService,
  getClientsService,
  updateClientService,
} from "@src/services/clientService";
import { Request, Response } from "express";

// Obtener Todos los Clientes
export const getClients = async (
  req: Request,
  res: Response
): Promise<void> => {
  const clients = await getClientsService();
  res.json(clients);
};

//Obtener cliente por su ID
export const getClientId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id);
  const client = await getClientIdService(id);
  res.json(client);
};

//Crear un cliente
export const pushClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  const newClient = await createClientService(req.body);
  res.status(201).json(newClient);
};

//Modificar un cliente por su id
export const putClient = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = req.body;
  const updatedClient = await updateClientService(Number(id), data);
  res.status(200).json(updatedClient);
};

// Eliminar cliente por su Id
export const deleteClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const deletedClient = await deleteClientService(Number(id));
  res.status(200).json(deletedClient);
};
