import {
  deleteVehicle,
  getVehicleId,
  getVehicles,
  getVehiculosEstadisticas,
  pushVehicle,
  putVehicle,
} from "@src/controllers/VehicleController";
import { authToken } from "@src/middlewares/authToken";
import { Router } from "express";

export const vehicleRoute = Router();

//Endpoint para obtener todas las estadisticas de los vehiculos
vehicleRoute.get("/estadisticas", authToken, getVehiculosEstadisticas);

//Endpoint para obtener todos los vehiculos
vehicleRoute.get("/", authToken, getVehicles);

//Endpoint para obtener un vehiculo por su ID
vehicleRoute.get("/:id", authToken, getVehicleId);

//Endpoint para crear un vehiculo
vehicleRoute.post("/", authToken, pushVehicle);

//Endpoint para modificar un vehiculo por su ID
vehicleRoute.put("/:id", authToken, putVehicle);

//Endpoint para eliminar un vehiculo por su ID
vehicleRoute.delete("/:id", authToken, deleteVehicle);
