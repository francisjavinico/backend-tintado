import {
  deleteClient,
  getClientId,
  getClients,
  pushClient,
  putClient,
} from "@src/controllers/ClientController";
import { authRole } from "@src/middlewares/authRole";
import { authToken } from "@src/middlewares/authToken";
import { Router } from "express";

export const clientRoute = Router();

//Endpoint para obtener todos los clientes
clientRoute.get("/", authToken, getClients);

//Endpoint para obtener un cliente por su ID
clientRoute.get("/:id", authToken, getClientId);

//Endpoint para crear un cliente
clientRoute.post("/", authToken, pushClient);

//Endpoint para modificar un cliente por su ID
clientRoute.put("/:id", authToken, authRole("admin", "empleado"), putClient);

//Endpoint para eliminar un cliente por su ID
clientRoute.delete(
  "/:id",
  authToken,
  authRole("admin", "empleado"),
  deleteClient
);
