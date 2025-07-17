import { Prisma, PrismaClient } from "@prisma/client";
import { ConflictError } from "@src/errors/ConflictError";
import { NotFoundError } from "@src/errors/NotFoundError";
import { ValidationError } from "@src/errors/ValidationError";
import { clientSchema, clientEditSchema } from "@src/schemas/clientSchema";

const prisma = new PrismaClient();
type ClientCreateInput = Prisma.ClienteCreateInput;
type UpdateCreateInput = Prisma.ClienteUpdateInput;

// Servicio Crear Cliente
export async function createClientService(client: ClientCreateInput) {
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
    aceptaPromociones,
  } = parsedData.data;

  const documentoIdentidadExist = await prisma.cliente.findUnique({
    where: { documentoIdentidad },
    select: { id: true },
  });
  if (documentoIdentidadExist) {
    throw new ConflictError("El cliente ya existe");
  }
  const newClient = await prisma.cliente.create({
    data: {
      nombre,
      apellido,
      email,
      telefono,
      documentoIdentidad,
      direccion,
      consentimientoLOPD,
      aceptaPromociones,
    },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      telefono: true,
      documentoIdentidad: true,
      direccion: true,
      consentimientoLOPD: true,
      createdAt: true,
    },
  });
  return newClient;
}

// Servicio Obtener todos los clientes
export async function getClientsService() {
  const clients = await prisma.cliente.findMany({
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      telefono: true,
      documentoIdentidad: true,
      direccion: true,
      createdAt: true,
    },
  });
  return clients;
}

// Servicio Obtener cliente por su ID
export async function getClientIdService(id: number) {
  const client = await prisma.cliente.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      telefono: true,
      documentoIdentidad: true,
      direccion: true,
      createdAt: true,
    },
  });
  if (!client) {
    throw new NotFoundError("Cliente no encontrado");
  }
  return client;
}

//Servicio Para Modificar un Cliente por su Id
export async function updateClientService(
  id: number,
  client: UpdateCreateInput
) {
  const parsedData = clientEditSchema.safeParse(client);
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
    aceptaPromociones,
  } = parsedData.data;
  const documentoIdentidadExist = await prisma.cliente.findUnique({
    where: { documentoIdentidad },
    select: { id: true },
  });
  if (documentoIdentidadExist && documentoIdentidadExist.id !== Number(id)) {
    throw new ConflictError("El cliente ya existe");
  }
  const updatedClient = await prisma.cliente.update({
    where: { id },
    data: {
      nombre,
      apellido,
      email,
      telefono,
      documentoIdentidad,
      direccion,
      consentimientoLOPD,
      aceptaPromociones,
    },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      telefono: true,
      documentoIdentidad: true,
      direccion: true,
      consentimientoLOPD: true,
      createdAt: true,
    },
  });
  if (!updatedClient) {
    throw new NotFoundError("Cliente no encontrado");
  }
  return updatedClient;
}

//Servicio Para Eliminar Usuario por Id
export async function deleteClientService(id: number) {
  const deletedClient = await prisma.cliente.delete({
    where: { id: Number(id) },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      telefono: true,
      documentoIdentidad: true,
      direccion: true,
      createdAt: true,
    },
  });
  if (!deletedClient) {
    throw new NotFoundError("Cliente no encontrado");
  }
  return deletedClient;
}
