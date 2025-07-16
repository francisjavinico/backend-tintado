import {
  crearCitaService,
  deleteCitaService,
  finalizarCitaService,
  getCitaIdService,
  getCitasService,
  updateCitaService,
} from "@src/services/citaService";
import { Request, Response, NextFunction } from "express";

export async function pushCita(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cita = await crearCitaService(req.body);
    res.status(201).json(cita);
  } catch (error) {
    next(error);
  }
}

export const getCitaId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getCitaIdService(Number(req.params.id));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCitas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clienteId = req.query.clienteId
    ? Number(req.query.clienteId)
    : undefined;
  try {
    const result = await getCitasService(clienteId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const putCita = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await updateCitaService(Number(req.params.id), req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteCita = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await deleteCitaService(Number(req.params.id));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const finalizarCita = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await finalizarCitaService(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

import { getCitasPendientesHoyService } from "@src/services/citaService";

export const getCitasPendientesHoy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getCitasPendientesHoyService();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
