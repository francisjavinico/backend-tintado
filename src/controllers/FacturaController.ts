import { ValidationError } from "@src/errors/ValidationError";
import { getFacturasQuerySchema } from "@src/schemas/facturaSchema";
import {
  createFacturaService,
  deleteFacturaService,
  FacturasFilter,
  getBalanceService,
  getFacturaService,
  getFacturasIdService,
  updateFacturaService,
} from "@src/services/facturaService";
import { generarFacturaPDF } from "@src/util/generarFacturaPDF";
import { NextFunction, Request, Response } from "express";

export const pushFactura = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await createFacturaService(req.body);
  res.status(201).json(result);
};

export const getFacturaFilter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsed = getFacturasQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message);
  }
  const filter: FacturasFilter = parsed.data;
  const factura = await getFacturaService(filter);
  res.status(200).json(factura);
};

export const getFacturaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  const result = await getFacturasIdService(id);
  res.status(200).json(result);
};

export const putFactura = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  const data = req.body;
  const result = await updateFacturaService(id, data);
  res.status(200).json(result);
};

export const deleteFactura = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  const result = await deleteFacturaService(id);
  res.status(200).json(result);
};

export const getBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsed = getFacturasQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message);
  }
  const filter: FacturasFilter = parsed.data;
  const factura = await getBalanceService(filter);
  res.status(200).json(factura);
};

export const getFacturaPDF = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "ID inválido" });
    return;
  }

  try {
    const pdf = await generarFacturaPDF(id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=factura-${id}.pdf`);
    res.send(pdf);
  } catch (error) {
    res
      .status(500)
      .json({ message: "No se pudo generar el PDF de la factura" });
  }
};
