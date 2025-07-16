import { Prisma, PrismaClient } from "@prisma/client";
import { NotFoundError } from "@src/errors/NotFoundError";
import { ConflictError } from "@src/errors/ConflictError";
import { ValidationError } from "@src/errors/ValidationError";
import { garantiaSchema } from "@src/schemas/garantiaSchema";
import { addMonths } from "date-fns";

const prisma = new PrismaClient();
type GarantiasCreateInput = Prisma.GarantiaCreateInput;

export async function createGarantiaService(
  garantia: GarantiasCreateInput,
  citaId: number,
  clienteId: number
) {
  const parsed = garantiaSchema.safeParse(garantia);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message);
  }
  const { descripcion, fechaInicio, fechaFin } = parsed.data;

  const cita = await prisma.cita.findUnique({ where: { id: citaId } });
  if (!cita) {
    throw new NotFoundError("No existe cita con los datos suministrados");
  }

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
  if (!cliente) {
    throw new NotFoundError("No existe el cliente en la base de datos");
  }

  try {
    return await prisma.garantia.create({
      data: {
        descripcion,
        fechaInicio,
        fechaFin,
        clienteId: cliente.id,
        citaId: cita.id,
      },
    });
  } catch (e: any) {
    if (e.code === "P2002") {
      throw new ConflictError("Ya existe una garantía para esta cita");
    }
    throw e;
  }
}

export async function getGarantiaIdService(id: number) {
  const garantia = await prisma.garantia.findUnique({ where: { id } });
  if (!garantia) {
    throw new NotFoundError("Garantía no encontrada");
  }
  return garantia;
}

export async function getGarantiasService() {
  return await prisma.garantia.findMany();
}

export async function updateGarantiaService(
  id: number,
  garantia: GarantiasCreateInput
) {
  const parsed = garantiaSchema.safeParse(garantia);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message);
  }
  const { descripcion, fechaInicio, fechaFin } = parsed.data;

  try {
    return await prisma.garantia.update({
      where: { id },
      data: { descripcion, fechaInicio, fechaFin },
    });
  } catch (e: any) {
    if (e.code === "P2025") {
      throw new NotFoundError("Garantía no encontrada");
    }
    throw e;
  }
}

export async function deleteGarantiaService(id: number) {
  try {
    return await prisma.garantia.delete({ where: { id } });
  } catch (e: any) {
    if (e.code === "P2025") {
      throw new NotFoundError("Garantía no encontrada");
    }
    throw e;
  }
}

export async function createGarantiaAutoService(
  citaId: number,
  matricula?: string,
  tipoLamina?: string
) {
  const cita = await prisma.cita.findUnique({
    where: { id: citaId },
    include: { cliente: true },
  });

  if (!cita || !cita.clienteId) {
    throw new NotFoundError("La cita no existe o no tiene cliente asociado");
  }

  const garantiaExistente = await prisma.garantia.findUnique({
    where: { citaId },
  });

  if (garantiaExistente) {
    return garantiaExistente;
  }

  const fechaInicio = new Date();
  const fechaFin = addMonths(fechaInicio, 12);

  const garantia = await prisma.garantia.create({
    data: {
      clienteId: cita.clienteId,
      citaId: cita.id,
      descripcion:
        tipoLamina ||
        `Garantía generada automáticamente para la cita: ${cita.descripcion}`,
      fechaInicio,
      fechaFin,
      ...(matricula && { matricula }),
    },
  });

  return garantia;
}
