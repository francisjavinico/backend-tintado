import {
  deleteGarantia,
  getGarantiaId,
  getGarantias,
  pushGarantia,
  putGarantia,
} from "@src/controllers/GarantiaController";
import { authRole } from "@src/middlewares/authRole";
import { authToken } from "@src/middlewares/authToken";
import { Router } from "express";

export const garantiaRoute = Router();

//Endpoint para obtener todas las garantias
garantiaRoute.get("/", authToken, getGarantias);

//Endpoint para obtener una garantia por su ID
garantiaRoute.get("/:id", authToken, getGarantiaId);

//Endpoint para crear una garantia
garantiaRoute.post("/:citaId/:clienteId", authToken, pushGarantia);

//Endpoint para modificar una garantia por su ID
garantiaRoute.put(
  "/:id",
  authToken,
  authRole("admin", "empleado"),
  putGarantia
);

//Endpoint para eliminar una garantia por su ID
garantiaRoute.delete(
  "/:id",
  authToken,
  authRole("admin", "empleado"),
  deleteGarantia
);
