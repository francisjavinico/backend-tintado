import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "@src/errors/NotFoundError";
import { ValidationError } from "@src/errors/ValidationError";
import { createCitaSchema, updateCitaSchema } from "@src/schemas/citasSchema";
import { createReciboAutoService } from "./reciboService";
import { createGarantiaAutoService } from "./garantiaService";
import { createFacturaService } from "./facturaService";
import { sendEmail } from "@src/util/mailer";
import { generarCorreoCliente } from "@src/util/emailTemplates";
import { generarReciboPDF } from "@src/util/generarReciboPdf";
import { generarGarantiaPDF } from "@src/util/generarGarantiaPDF";
import { generarFacturaPDF } from "@src/util/generarFacturaPDF";
import { FinalizarCitaInput } from "@src/schemas/finalizarCitaSchema";
import { endOfDay, startOfDay } from "date-fns";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient();
type CitasCreateInput = Prisma.CitaCreateInput;
type CitaUpdateInput = Prisma.CitaUpdateInput;

export async function crearCitaService(cita: Prisma.CitaUncheckedCreateInput) {
  const parsed = createCitaSchema.safeParse(cita);
  if (!parsed.success) throw new ValidationError(parsed.error.message);

  const {
    estado,
    fecha,
    matricula,
    presupuestoMax,
    presupuestoBasico,
    presupuestoIntermedio,
    presupuestoPremium,
    telefono,
    vehiculoId,
    clienteId,
    servicios, // <-- nuevo
  } = parsed.data;

  const vehiculo = await prisma.vehiculo.findUnique({
    where: { id: vehiculoId },
    select: { id: true },
  });
  if (!vehiculo) throw new NotFoundError("El vehiculo no existe");

  if (clienteId) {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { id: true },
    });
    if (!cliente) throw new NotFoundError("El cliente no existe");
  }

  const existeConflicto = await prisma.cita.findFirst({
    where: {
      fecha: new Date(fecha),
    },
    select: { id: true },
  });

  if (existeConflicto) {
    throw new ValidationError(
      "Ya existe una cita programada en esa fecha y hora."
    );
  }

  try {
    const citaData: any = {
      estado,
      fecha,
      presupuestoMax:
        typeof presupuestoMax === "number" ? presupuestoMax : null,
      presupuestoBasico:
        typeof presupuestoBasico === "number" ? presupuestoBasico : null,
      presupuestoIntermedio:
        typeof presupuestoIntermedio === "number"
          ? presupuestoIntermedio
          : null,
      presupuestoPremium:
        typeof presupuestoPremium === "number" ? presupuestoPremium : null,
      telefono,
      matricula: matricula ?? undefined,
      servicios: servicios ?? [],
    };
    if (typeof clienteId === "number") {
      citaData.cliente = { connect: { id: clienteId } };
      if (citaData.clienteId) delete citaData.clienteId;
    }
    // Usar relación anidada para el vehículo
    citaData.vehiculo = { connect: { id: vehiculoId } };
    // Eliminar citaData.vehiculoId si existe
    if (citaData.vehiculoId) delete citaData.vehiculoId;
    const nuevaCita = await prisma.cita.create({
      data: citaData,
      select: {
        id: true,
        descripcion: true,
        estado: true,
        fecha: true,
        presupuestoMax: true,
        presupuestoBasico: true,
        presupuestoIntermedio: true,
        presupuestoPremium: true,
        telefono: true,
        vehiculoId: true,
        clienteId: true,
        matricula: true,
        servicios: true,
      },
    });

    // Si tienes lógica para crear PresupuestoVehiculo, puedes adaptarla aquí si es necesario
    // await prisma.presupuestoVehiculo.create({ ... });

    return nuevaCita;
  } catch (error) {
    throw error;
  }
}

export async function getCitaIdService(id: number) {
  const cita = await prisma.cita.findUnique({
    where: { id },
    select: {
      id: true,
      fecha: true,
      descripcion: true,
      estado: true,
      telefono: true,
      presupuestoMax: true,
      presupuestoBasico: true,
      presupuestoIntermedio: true,
      presupuestoPremium: true,
      matricula: true,
      clienteId: true,
      vehiculoId: true,
      cliente: true,
      vehiculo: true,
      servicios: true, // <-- incluir servicios
    },
  });
  if (!cita) throw new NotFoundError("Cita no encontrada");
  return cita;
}

export async function getCitasService(clienteId?: number) {
  const citas = await prisma.cita.findMany({
    where: clienteId ? { clienteId } : {},
    orderBy: { fecha: "desc" },
    select: {
      id: true,
      fecha: true,
      descripcion: true,
      estado: true,
      telefono: true,
      presupuestoMax: true,
      presupuestoBasico: true,
      presupuestoIntermedio: true,
      presupuestoPremium: true,
      matricula: true,
      clienteId: true,
      vehiculoId: true,
      cliente: true,
      vehiculo: true,
      servicios: true, // <-- incluir servicios
    },
  });
  return citas;
}

export async function updateCitaService(id: number, cita: CitaUpdateInput) {
  const parsed = updateCitaSchema.safeParse(cita);
  if (!parsed.success) throw new ValidationError(parsed.error.message);

  const citaExistente = await prisma.cita.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!citaExistente) throw new NotFoundError("Cita no encontrada");

  if (!parsed.data.fecha) throw new ValidationError("La fecha es requerida");

  const existeConflicto = await prisma.cita.findFirst({
    where: {
      fecha: new Date(parsed.data.fecha),
      NOT: { id },
    },
    select: { id: true },
  });

  if (existeConflicto) {
    throw new ValidationError(
      "Ya existe una cita programada en esa fecha y hora."
    );
  }

  // Extrae clienteId, vehiculoId y el resto de los datos
  const { clienteId, vehiculoId, ...restData } = parsed.data;

  // El tipo correcto para los datos de actualización
  const dataToUpdate: Prisma.CitaUpdateInput = {
    ...restData,
    presupuestoMax: restData.presupuestoMax ?? undefined,
    presupuestoBasico: restData.presupuestoBasico ?? undefined,
    presupuestoIntermedio: restData.presupuestoIntermedio ?? undefined,
    presupuestoPremium: restData.presupuestoPremium ?? undefined,
  };

  // Lógica para la relación con el cliente
  if (clienteId === null || clienteId === undefined) {
    dataToUpdate.cliente = { disconnect: true };
  } else {
    dataToUpdate.cliente = { connect: { id: clienteId } };
  }

  // Lógica para la relación con el vehículo
  if (vehiculoId) {
    dataToUpdate.vehiculo = { connect: { id: vehiculoId } };
  }

  const updatedCita = await prisma.cita.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      descripcion: true,
      estado: true,
      fecha: true,
      presupuestoMax: true,
      presupuestoBasico: true,
      presupuestoIntermedio: true,
      presupuestoPremium: true,
      telefono: true,
      vehiculoId: true,
      clienteId: true,
      matricula: true,
    },
  });

  return updatedCita;
}

export async function deleteCitaService(id: number) {
  const cita = await prisma.cita.delete({ where: { id } });
  if (!cita) throw new NotFoundError("Cita no encontrada");
  return cita;
}

export async function getPresupuestosByVehiculoIdService(vehiculoId: number) {
  const presupuestos = await prisma.presupuestoVehiculo.findMany({
    where: { vehiculoId },
    orderBy: { fecha: "desc" },
    include: { cita: true },
  });

  if (presupuestos.length === 0)
    throw new NotFoundError("Este vehículo no tiene presupuestos registrados.");

  return presupuestos;
}

export async function finalizarCitaService(data: any) {
  const {
    citaId,
    clienteId,
    servicios,
    generarFactura,
    matricula,
    tipoLamina,
  } = data;

  const cita = await prisma.cita.findUnique({ where: { id: citaId } });
  if (!cita) throw new NotFoundError("La cita no existe");

  if (cita.estado === "completada") {
    throw new ValidationError("La cita ya está marcada como completada");
  }

  let matriculaFinal: string | undefined = undefined;
  if (matricula === null || matricula === undefined) {
    matriculaFinal =
      cita.matricula && typeof cita.matricula === "string"
        ? cita.matricula
        : undefined;
  } else {
    matriculaFinal = matricula;
  }
  // Actualizar servicios y estado
  let updatedCita = await prisma.cita.update({
    where: { id: citaId },
    data: {
      estado: "completada",
      matricula: cleanMatricula(matriculaFinal ?? undefined),
      servicios: servicios ?? cita.servicios,
    },
  });

  let recibo = null;
  let factura = null;

  // Generar items según los servicios realizados (no usar presupuestos)
  const serviciosCita = servicios ?? cita.servicios;
  const items = (serviciosCita || []).map((s: any) => ({
    descripcion: s.nombre === "Otros" ? s.descripcion : s.nombre,
    cantidad: 1,
    precioUnit: s.precio ?? 0,
  }));

  if (generarFactura) {
    factura = await createFacturaService({
      clienteId,
      citaId,
      servicios: serviciosCita,
      items,
      matricula: cleanMatricula(updatedCita.matricula),
    });
  } else {
    recibo = await createReciboAutoService({
      citaId,
      items,
      matricula: cleanMatricula(updatedCita.matricula),
    });
  }

  const adjuntos = [];

  if (generarFactura && factura) {
    const facturaPDF = await generarFacturaPDF(factura.id);
    adjuntos.push({ filename: "factura.pdf", content: facturaPDF });
  }

  if (!generarFactura && recibo) {
    const reciboPDF = await generarReciboPDF(recibo.id);
    adjuntos.push({ filename: "recibo.pdf", content: reciboPDF });
  }

  // Cambiado: pasar tipoLamina a createGarantiaAutoService si algún servicio es Tintado de Lunas
  const esTintadoLunas =
    Array.isArray(serviciosCita) &&
    serviciosCita.some((s: any) => s.nombre === "Tintado de Lunas");
  if (esTintadoLunas) {
    const garantia = await createGarantiaAutoService(
      citaId,
      updatedCita.matricula ?? undefined,
      tipoLamina
    );
    // Solo generar y adjuntar garantía si existe
    if (garantia) {
      const garantiaPDF = await generarGarantiaPDF(citaId);
      adjuntos.push({ filename: "garantia.pdf", content: garantiaPDF });
    }
  }

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
  if (!cliente?.email) return updatedCita;

  const html = generarCorreoCliente({
    nombre: cliente.nombre ?? "",
    tieneFactura: generarFactura,
  });

  await sendEmail({
    to: cliente.email,
    subject: "Documentación de su cita",
    html,
    attachments: adjuntos,
  });

  return updatedCita;
}

export async function getCitasPendientesHoyService() {
  const hoy = new Date();
  const citas = await prisma.cita.findMany({
    where: {
      estado: "pendiente",
      fecha: {
        gte: startOfDay(hoy),
        lte: endOfDay(hoy),
      },
    },
    orderBy: { fecha: "asc" },
    include: {
      cliente: true,
      vehiculo: true,
    },
  });
  return citas;
}

function cleanMatricula(
  matricula: string | null | undefined
): string | undefined {
  if (matricula === null || matricula === undefined) return undefined;
  return typeof matricula === "string" ? matricula : undefined;
}
