import { Prisma, PrismaClient } from "@prisma/client";
import { NotFoundError } from "@src/errors/NotFoundError";
import { ValidationError } from "@src/errors/ValidationError";
import { clientSchema } from "@src/schemas/clientSchema";
import { z } from "zod";

const prisma = new PrismaClient();
type ClientData = z.infer<typeof clientSchema>;
type UpdateCreateInput = Prisma.ClienteUpdateInput;

export async function checkinClientService(citaId: number, client: ClientData) {
  const parsedData = clientSchema.safeParse(client);
  if (!parsedData.success) {
    const errors = parsedData.error.message;
    throw new ValidationError(errors);
  }
  const {
    nombre,
    apellido,
    email,
    telefono,
    documentoIdentidad,
    direccion,
    consentimientoLOPD,
    aceptaPromociones, // <-- Nuevo campo
  } = parsedData.data;

  // Validar email único (si se proporciona email)
  if (email) {
    const emailExist = await prisma.cliente.findFirst({
      where: {
        email: email,
        telefono: { not: telefono },
      },
      select: { id: true },
    });
    if (emailExist) {
      throw new (await import("@src/errors/ConflictError")).ConflictError(
        "El email ya está registrado para otro cliente"
      );
    }
  }

  // Validar documentoIdentidad único (si se proporciona documentoIdentidad)
  if (documentoIdentidad) {
    const docExist = await prisma.cliente.findFirst({
      where: {
        documentoIdentidad: documentoIdentidad,
        telefono: { not: telefono },
      },
      select: { id: true },
    });
    if (docExist) {
      throw new (await import("@src/errors/ConflictError")).ConflictError(
        "El documento de identidad ya está registrado para otro cliente"
      );
    }
  }

  let clientRecord;

  const telefonoExist = await prisma.cliente.findUnique({
    where: { telefono },
  });
  if (telefonoExist) {
    clientRecord = await prisma.cliente.update({
      where: { telefono },
      data: {
        nombre,
        apellido,
        email,
        telefono,
        documentoIdentidad,
        direccion,
        consentimientoLOPD,
        aceptaPromociones, // <-- Nuevo campo
      },
    });
  } else {
    clientRecord = await prisma.cliente.create({
      data: {
        nombre,
        apellido,
        email,
        telefono,
        documentoIdentidad,
        direccion,
        consentimientoLOPD,
        aceptaPromociones, // <-- Nuevo campo
      },
    });
  }

  const citaExist = await prisma.cita.findUnique({
    where: { id: citaId },
  });

  if (!citaExist) {
    throw new NotFoundError("Cita no encontrada");
  }

  const cita = await prisma.cita.update({
    where: { id: citaId },
    data: { clienteId: clientRecord.id },
  });
  return { clientRecord, cita };
}
