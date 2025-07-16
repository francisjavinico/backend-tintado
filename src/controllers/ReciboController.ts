import { Request, Response, NextFunction } from "express";
import { ValidationError } from "@src/errors/ValidationError";
import {
  createReciboService,
  deleteReciboService,
  getReciboService,
  getRecibosIdService,
  getBalanceService,
  updateReciboService,
  ReciboFilter,
  convertirReciboAFacturaService,
} from "@src/services/reciboService";
import { getRecibosQuerySchema } from "@src/schemas/reciboSchema";
import { generarReciboPDF } from "@src/util/generarReciboPdf";

// Crear un nuevo recibo
export const pushRecibo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await createReciboService(req.body);
  res.status(201).json(result);
};

// Obtener recibos por filtro
export const getReciboFilter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsed = getRecibosQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message);
  }

  const filter: ReciboFilter = parsed.data;
  const result = await getReciboService(filter);
  res.status(200).json(result);
};

// Obtener recibo por ID
export const getReciboById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  const result = await getRecibosIdService(id);
  res.status(200).json(result);
};

// Actualizar recibo por ID
export const putRecibo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  const data = req.body;
  const result = await updateReciboService(id, data);
  res.status(200).json(result);
};

// Eliminar recibo por ID
export const deleteRecibo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  const result = await deleteReciboService(id);
  res.status(200).json(result);
};

// Obtener resumen financiero (balance) de recibos
export const getRecibosBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsed = getRecibosQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message);
  }

  const filter: ReciboFilter = parsed.data;
  const result = await getBalanceService(filter);
  res.status(200).json(result);
};

export const getReciboPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "ID inválido" });
    return;
  }

  try {
    const pdf = await generarReciboPDF(id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=recibo-${id}.pdf`);
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ message: "No se pudo generar el PDF del recibo" });
  }
};

// Convertir un recibo en factura
export const convertirReciboAFactura = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const factura = await convertirReciboAFacturaService(id);
    res.status(201).json(factura);
  } catch (error) {
    next(error);
  }
};
