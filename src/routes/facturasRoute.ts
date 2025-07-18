import {
  deleteFactura,
  getBalance,
  getFacturaById,
  getFacturaFilter,
  getFacturaPDF,
  pushFactura,
  putFactura,
  reenviarFacturaEmail,
} from "@src/controllers/FacturaController";
import { authRole } from "@src/middlewares/authRole";
import { authToken } from "@src/middlewares/authToken";
import { Router } from "express";

export const facturaRoute = Router();

//Endpoint para obtener las facturas de acuerdo a filtro
facturaRoute.get("/", authToken, getFacturaFilter);

//Endpoint para obtener una factura por su ID
facturaRoute.get("/:id", authToken, getFacturaById);

//Endpoint para crear una factura
facturaRoute.post("/", authToken, pushFactura);

//Endpoint para modificar una factura por su ID
facturaRoute.put("/:id", authToken, authRole("admin", "empleado"), putFactura);

//Endpoint para eliminar una factura por su ID
facturaRoute.delete(
  "/:id",
  authToken,
  authRole("admin", "empleado"),
  deleteFactura
);

//EndPoint para obtener balances
facturaRoute.get("/balance", authToken, getBalance);

//EndPoint para obtener facturas en pdf
facturaRoute.get("/:id/pdf", authToken, getFacturaPDF);

facturaRoute.post("/:id/reenviar-email", authToken, reenviarFacturaEmail);
