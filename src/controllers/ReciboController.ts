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
import { sendEmail } from "@src/util/mailer";
import { generarGarantiaPDF } from "@src/util/generarGarantiaPDF";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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

export const reenviarReciboEmail = async (
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
    const recibo = await getRecibosIdService(id);
    if (!recibo || !recibo.cliente || !recibo.cliente.email) {
      res.status(400).json({ message: "Datos del cliente incompletos" });
      return;
    }
    const reciboPDF = await generarReciboPDF(recibo.id);
    const nombreCliente =
      [recibo.cliente.nombre, recibo.cliente.apellido]
        .filter(Boolean)
        .join(" ") || "Cliente";
    const attachments = [
      {
        filename: `Recibo - ${nombreCliente}.pdf`,
        content: reciboPDF,
      },
    ];
    // Si existe garantía para la cita, adjuntarla
    const garantia = await prisma.garantia.findUnique({
      where: { citaId: recibo.citaId },
    });
    if (garantia) {
      const garantiaPDF = await generarGarantiaPDF(recibo.citaId);
      attachments.push({ filename: "garantia.pdf", content: garantiaPDF });
    }
    await sendEmail({
      to: recibo.cliente.email,
      subject: `Recibo N° ${recibo.numeroAnual} - Ahumaglass`,
      html: `<p>Estimado/a ${nombreCliente},<br>Adjuntamos su recibo en PDF.<br>Gracias por confiar en nosotros.</p>`,
      attachments,
    });
    res.json({ message: "Recibo enviado correctamente al cliente" });
  } catch (error) {
    res.status(500).json({ message: "No se pudo enviar el recibo" });
  }
};
