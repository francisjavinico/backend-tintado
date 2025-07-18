import { Router } from "express";
import {
  pushRecibo,
  getReciboFilter,
  getReciboById,
  putRecibo,
  deleteRecibo,
  getRecibosBalance,
  getReciboPDF,
  convertirReciboAFactura,
  reenviarReciboEmail,
} from "@src/controllers/ReciboController";
import { authToken } from "@src/middlewares/authToken";
import { authRole } from "@src/middlewares/authRole";

export const recibosRoute = Router();
// Endpoint para obtener el PDF de un recibo
recibosRoute.get("/pdf/:id", getReciboPDF);

// Obtener todos los recibos según filtro
recibosRoute.get("/", authToken, getReciboFilter);

// Obtener un recibo por ID
recibosRoute.get("/:id", authToken, getReciboById);

// Crear un nuevo recibo
recibosRoute.post("/", authToken, pushRecibo);

// Actualizar un recibo existente
recibosRoute.put("/:id", authToken, authRole("admin", "empleado"), putRecibo);

// Eliminar un recibo
recibosRoute.delete(
  "/:id",
  authToken,
  authRole("admin", "empleado"),
  deleteRecibo
);

// Obtener balance de recibos
recibosRoute.get("/balance", authToken, getRecibosBalance);

// Endpoint para convertir un recibo en factura
recibosRoute.post(
  "/:id/convertir-a-factura",
  authToken,
  authRole("admin", "empleado"),
  convertirReciboAFactura
);

recibosRoute.post("/:id/reenviar-email", authToken, reenviarReciboEmail);
