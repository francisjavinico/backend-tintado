import { Router } from "express";
import { authToken } from "../middlewares/authToken";
import { getPresupuestosVehiculo } from "../controllers/VehicleController";
export const presupuestoVehiculoRoute = Router();

presupuestoVehiculoRoute.get(
  "/:vehiculoId",
  authToken,
  getPresupuestosVehiculo
);
