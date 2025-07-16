import { checkIn } from "@src/controllers/CheckinController";
import {
  deleteCita,
  finalizarCita,
  getCitaId,
  getCitas,
  getCitasPendientesHoy,
  pushCita,
  putCita,
} from "@src/controllers/CitaController";
import { authToken } from "@src/middlewares/authToken";
import { Router } from "express";

export const citasRoute = Router();

//Endpoint para obtener todas las citas
citasRoute.get("/", authToken, getCitas);

//Endpoint para consultar citas pendientes de hoy
citasRoute.get("/hoy/pendientes", authToken, getCitasPendientesHoy);

//Endpoint para obtener una cita por su ID
citasRoute.get("/:id", authToken, getCitaId);

//Endpoint para crear una cita
citasRoute.post("/", authToken, pushCita);

//Endpoint para modificar una cita por su ID
citasRoute.put("/:id", authToken, putCita);

//Endpoint para eliminar una cita por su ID
citasRoute.delete("/:id", authToken, deleteCita);

//Endpoint para que el cliente rellene sus datos
citasRoute.put("/:id/checkin", checkIn);

//Endpoint para finalizar cita
citasRoute.post("/finalizar", authToken, finalizarCita);
