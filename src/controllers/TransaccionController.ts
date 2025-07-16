import { ValidationError } from "@src/errors/ValidationError";
import {
  getTransaccionesQuerySchema,
  getTransaccionesResumenSchema,
} from "@src/schemas/transaccionSchema";
import {
  createTransaccionService,
  deleteTransaccionService,
  getTransaccionesResumenService,
  getTransaccionIdService,
  getTransaccionService,
  TransaccionFilter,
  updateTransaccionService,
} from "@src/services/transaccionService";
import { NextFunction, Request, Response } from "express";

export const createTransaccion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await createTransaccionService(req.body);
  res.status(201).json(result);
};

export const getTransacciones = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsed = getTransaccionesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message);
  }
  const filter: TransaccionFilter = parsed.data;
  const resultado = await getTransaccionService(filter);
  if (resultado.total === undefined) {
    // Sin filtros: solo transacciones
    res.status(200).json(resultado.transacciones);
  } else {
    // Con filtros: transacciones + total
    res.status(200).json(resultado);
  }
};

export const getTransaccionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  const result = await getTransaccionIdService(id);
  res.status(200).json(result);
};

export const putTransaccion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  const data = req.body;
  const result = await updateTransaccionService(id, data);
  res.status(200).json(result);
};

export const deleteTransaccion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  const result = await deleteTransaccionService(id);
  res.status(200).json(result);
};

export const getResumenGrafico = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsed = getTransaccionesResumenSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message);
  }

  const { tipo, dateFrom, dateTo } = parsed.data;

  const agrupacion =
    tipo === "diario" ? "dia" : tipo === "semanal" ? "semana" : "mes";

  const resumen = await getTransaccionesResumenService(
    agrupacion,
    dateFrom,
    dateTo
  );

  res.status(200).json(resumen);
};
