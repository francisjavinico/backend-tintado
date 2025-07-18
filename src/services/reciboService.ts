import { Prisma, PrismaClient } from "@prisma/client";
import { NotFoundError } from "@src/errors/NotFoundError";
import { ValidationError } from "@src/errors/ValidationError";
import {
  createReciboSchema,
  updateReciboSchema,
} from "@src/schemas/reciboSchema";
import { createTransaccionAutoService } from "./transaccionService";
import { generarFacturaPDF } from "@src/util/generarFacturaPDF";
import { sendEmail } from "@src/util/mailer";

const prisma = new PrismaClient();
type ReciboWhereInput = Prisma.ReciboWhereInput;
type ReciboCreateInput = Prisma.ReciboCreateInput;
type ReciboUpdateInput = Prisma.ReciboUpdateInput;

export interface ReciboFilter {
  clienteId?: number;
  cliente?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minTotal?: number;
  maxTotal?: number;
  page?: number;
  pageSize?: number;
}

export interface BalanceResult {
  count: number;
  sumTotal: number;
}

// Servicio para crear un recibo
export async function createReciboService(data: any) {
  const parsed = createReciboSchema.safeParse(data);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message);
  }
  const { citaId, clienteId, descripcion, items } = parsed.data;

  const citaExist = await prisma.cita.findUnique({
    where: { id: citaId },
    select: { id: true },
  });
  if (!citaExist)
    throw new NotFoundError("No existe la cita en la base de datos");

  const clienteExist = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: { id: true },
  });
  if (!clienteExist)
    throw new NotFoundError("No existe el cliente en la base de datos");

  const monto = items.reduce(
    (sum: number, i: any) => sum + i.cantidad * i.precioUnit,
    0
  );

  // Calcular numeroAnual correlativo real basado en registros existentes de RECIBOS
  const year = new Date().getFullYear();
  const maxNumero = await prisma.recibo.aggregate({
    where: {
      fecha: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
      },
    },
    _max: { numeroAnual: true },
  });
  const numeroAnual = (maxNumero._max.numeroAnual || 0) + 1;

  const recibo = await prisma.$transaction(async (tx) => {
    const nuevoRecibo = await tx.recibo.create({
      data: { clienteId, citaId, descripcion, monto, numeroAnual },
      select: { id: true },
    });

    const itemsData = items.map((it: any) => ({
      reciboId: nuevoRecibo.id,
      descripcion: it.descripcion,
      cantidad: it.cantidad,
      precioUnit: it.precioUnit,
    }));

    // Validación: todos los items deben tener descripción
    if (
      itemsData.some(
        (it: any) =>
          !it.descripcion ||
          typeof it.descripcion !== "string" ||
          it.descripcion.trim() === ""
      )
    ) {
      throw new ValidationError(
        "Todos los items deben tener una descripción válida"
      );
    }

    await tx.reciboItem.createMany({ data: itemsData });

    return tx.recibo.findUnique({
      where: { id: nuevoRecibo.id },
      select: {
        id: true,
        clienteId: true,
        citaId: true,
        descripcion: true,
        monto: true,
        fecha: true,
        numeroAnual: true,
        cliente: {
          select: { id: true, nombre: true, email: true, telefono: true },
        },
        items: {
          select: {
            id: true,
            descripcion: true,
            cantidad: true,
            precioUnit: true,
          },
        },
      },
    });
  });

  await createTransaccionAutoService("recibo", recibo!.id, recibo!.monto);
  return recibo;
}

// Servicio para obtener recibos por filtro
export async function getReciboService(filter: ReciboFilter) {
  const where: ReciboWhereInput = {};
  if (filter.cliente) {
    where.cliente = {
      OR: [
        { nombre: { contains: filter.cliente } },
        { email: { contains: filter.cliente } },
        { telefono: { contains: filter.cliente } },
      ],
    };
  }
  if (filter.clienteId !== undefined) where.clienteId = filter.clienteId;
  if (filter.dateFrom || filter.dateTo) {
    where.fecha = {
      ...(filter.dateFrom && { gte: filter.dateFrom }),
      ...(filter.dateTo && {
        lt: new Date(new Date(filter.dateTo).getTime() + 24 * 60 * 60 * 1000),
      }),
    };
  }

  if (filter.minTotal || filter.maxTotal) {
    where.monto = {
      ...(filter.minTotal && { gte: filter.minTotal }),
      ...(filter.maxTotal && { lte: filter.maxTotal }),
    };
  }

  const skip =
    filter.page && filter.pageSize
      ? (filter.page - 1) * filter.pageSize
      : undefined;
  const take = filter.pageSize;

  return prisma.recibo.findMany({
    where,
    include: { items: true, cliente: true },
    orderBy: { fecha: "desc" },
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  });
}

// Servicio para obtener recibo por ID
export async function getRecibosIdService(id: number) {
  const recibo = await prisma.recibo.findUnique({
    where: { id },
    include: { items: true, cliente: true },
  });
  if (!recibo) throw new NotFoundError("Recibo no encontrado");
  return recibo;
}

// Servicio para actualizar recibo
export async function updateReciboService(id: number, data: any) {
  const parsed = updateReciboSchema.safeParse(data);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message);
  }
  const { clienteId, citaId, descripcion, items } = parsed.data;

  const recibo = await prisma.recibo.findUnique({
    where: { id },
    select: { id: true, monto: true },
  });
  if (!recibo) throw new NotFoundError("Recibo no encontrado");

  let monto = recibo.monto;
  if (items) {
    monto = items.reduce(
      (sum: number, i: any) => sum + i.cantidad * i.precioUnit,
      0
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.recibo.update({
      where: { id },
      data: {
        ...(clienteId !== undefined && { clienteId }),
        ...(citaId !== undefined && { citaId }),
        ...(descripcion !== undefined && { descripcion }),
        ...(items && { monto }),
      },
    });

    if (items) {
      await tx.reciboItem.deleteMany({ where: { reciboId: id } });
      const itemsData = items.map((it: any) => ({
        reciboId: id,
        descripcion: it.descripcion,
        cantidad: it.cantidad,
        precioUnit: it.precioUnit,
      }));
      if (
        itemsData.some(
          (it: any) =>
            !it.descripcion ||
            typeof it.descripcion !== "string" ||
            it.descripcion.trim() === ""
        )
      ) {
        throw new ValidationError(
          "Todos los items deben tener una descripción válida"
        );
      }
      await tx.reciboItem.createMany({ data: itemsData });
    }

    return tx.recibo.findUnique({
      where: { id },
      select: {
        id: true,
        clienteId: true,
        citaId: true,
        descripcion: true,
        monto: true,
        fecha: true,
        cliente: {
          select: { id: true, nombre: true, email: true, telefono: true },
        },
        items: {
          select: {
            id: true,
            descripcion: true,
            cantidad: true,
            precioUnit: true,
          },
        },
      },
    });
  });
}

// Servicio para eliminar recibo
export async function deleteReciboService(id: number) {
  const recibo = await prisma.recibo.findUnique({ where: { id } });
  if (!recibo) throw new NotFoundError("Recibo no encontrado");

  return prisma.$transaction(async (tx) => {
    await tx.reciboItem.deleteMany({ where: { reciboId: id } });
    return tx.recibo.delete({ where: { id } });
  });
}

// Servicio para obtener balance de recibos
export async function getBalanceService(
  filter: ReciboFilter
): Promise<BalanceResult> {
  const where: ReciboWhereInput = {};
  if (filter.clienteId !== undefined) where.clienteId = filter.clienteId;
  if (filter.dateFrom || filter.dateTo) {
    where.fecha = {
      ...(filter.dateFrom && { gte: filter.dateFrom }),
      ...(filter.dateTo && {
        lt: new Date(new Date(filter.dateTo).getTime() + 24 * 60 * 60 * 1000),
      }),
    };
  }
  if (filter.minTotal || filter.maxTotal) {
    where.monto = {
      ...(filter.minTotal && { gte: filter.minTotal }),
      ...(filter.maxTotal && { lte: filter.maxTotal }),
    };
  }
  const result = await prisma.recibo.aggregate({
    where,
    _count: { _all: true },
    _sum: { monto: true },
  });

  return {
    count: result._count._all,
    sumTotal: result._sum.monto ?? 0,
  };
}

// Servicio para crear recibo automático desde cita
export async function createReciboAutoService(input: {
  citaId: number;
  items: {
    descripcion: string;
    cantidad: number;
    precioUnit: number;
  }[];
  matricula?: string;
}) {
  const { citaId, items, matricula } = input;

  const cita = await prisma.cita.findUnique({
    where: { id: citaId },
    include: { cliente: true },
  });
  if (!cita || !cita.clienteId) {
    throw new NotFoundError("La cita no existe o no tiene cliente asignado");
  }

  const reciboExistente = await prisma.recibo.findFirst({
    where: { citaId: cita.id },
  });
  if (reciboExistente) return reciboExistente;

  const monto = items.reduce(
    (sum: number, i: any) => sum + i.cantidad * i.precioUnit,
    0
  );

  // Calcular numeroAnual correlativo real basado en registros existentes de RECIBOS
  const year = new Date().getFullYear();
  const maxNumero = await prisma.recibo.aggregate({
    where: {
      fecha: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
      },
    },
    _max: { numeroAnual: true },
  });
  const numeroAnual = (maxNumero._max.numeroAnual || 0) + 1;

  const recibo = await prisma.$transaction(async (tx) => {
    const nuevoRecibo = await tx.recibo.create({
      data: {
        clienteId: cita.clienteId as number,
        citaId: cita.id,
        descripcion: `Recibo generado automáticamente por servicio: ${cita.descripcion}`,
        monto,
        numeroAnual,
        ...(matricula && { matricula }),
      },
    });

    const itemsData = items.map((i) => ({
      reciboId: nuevoRecibo.id,
      descripcion: i.descripcion,
      cantidad: i.cantidad,
      precioUnit: i.precioUnit,
    }));
    if (
      itemsData.some(
        (it: any) =>
          !it.descripcion ||
          typeof it.descripcion !== "string" ||
          it.descripcion.trim() === ""
      )
    ) {
      throw new ValidationError(
        "Todos los items deben tener una descripción válida"
      );
    }
    await tx.reciboItem.createMany({ data: itemsData });

    return tx.recibo.findUnique({
      where: { id: nuevoRecibo.id },
      include: { items: true, cliente: true },
    });
  });

  await createTransaccionAutoService("recibo", recibo!.id, recibo!.monto);
  return recibo;
}

/**
 * Convierte un recibo en factura, copia los datos del cliente, transfiere los items,
 * calcula el IVA incluido, crea la factura y marca el recibo como 'convertido'.
 * Devuelve la nueva factura creada.
 */
export async function convertirReciboAFacturaService(reciboId: number) {
  // Buscar el recibo con items y cliente
  const recibo = await prisma.recibo.findUnique({
    where: { id: reciboId },
    include: {
      items: true,
      cliente: true,
      cita: true,
    },
  });
  if (!recibo) throw new NotFoundError("Recibo no encontrado");
  if (recibo.estado === "convertido")
    throw new ValidationError("El recibo ya ha sido convertido a factura");

  // Copiar datos del cliente
  const cliente = recibo.cliente;
  if (!cliente) throw new NotFoundError("Cliente no encontrado para el recibo");

  // Preparar items para la factura
  const items = recibo.items.map((item) => ({
    descripcion: item.descripcion,
    cantidad: item.cantidad,
    precioUnit: item.precioUnit,
  }));

  // Calcular total (monto del recibo)
  const total = recibo.monto;
  // Calcular base imponible e IVA incluido
  const IVA_RATE = 0.21;
  const base = +(total / (1 + IVA_RATE)).toFixed(2);
  const iva = +(total - base).toFixed(2);

  // Calcular numeroAnual correlativo real basado en registros existentes
  const year = new Date().getFullYear();
  const maxNumero = await prisma.factura.aggregate({
    where: {
      fecha: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
      },
    },
    _max: { numeroAnual: true },
  });
  const numeroAnual = (maxNumero._max.numeroAnual || 0) + 1;

  // Obtener datos adicionales del cliente
  const nombreCompleto = [cliente.nombre, cliente.apellido]
    .filter(Boolean)
    .join(" ");
  const direccionCompleta = cliente.direccion || null;
  const dniNie = cliente.documentoIdentidad || null;
  // Matrícula: intentar obtener de la cita asociada
  let matricula = null;
  if (recibo.cita && recibo.cita.matricula) {
    matricula = recibo.cita.matricula;
  }

  // Crear la factura y marcar el recibo como convertido en una transacción
  const factura = await prisma.$transaction(async (tx) => {
    // Crear factura
    const nuevaFactura = await tx.factura.create({
      data: {
        clienteId: recibo.clienteId,
        citaId: recibo.citaId,
        subtotal: base,
        total: total,
        iva: iva,
        numeroAnual: numeroAnual,
        matricula: matricula,
        direccion_completa: direccionCompleta,
        nombre_cliente: nombreCompleto,
        dni_nie: dniNie,
        servicios: [], // Añadido para cumplir con el modelo Prisma
      },
      select: { id: true },
    });

    // Crear items de factura
    await tx.facturaItem.createMany({
      data: items.map((it) => ({
        facturaId: nuevaFactura.id,
        descripcion: it.descripcion,
        cantidad: it.cantidad,
        precioUnit: it.precioUnit,
      })),
    });

    // Marcar recibo como convertido
    await tx.recibo.update({
      where: { id: reciboId },
      data: { estado: "convertido" },
    });

    // Eliminar la transacción del recibo para evitar duplicados
    await tx.transaccion.deleteMany({
      where: {
        origen: "recibo",
        referenciaId: reciboId,
      },
    });

    // Crear transacción para la factura dentro de la misma transacción
    await tx.transaccion.create({
      data: {
        tipo: "ingreso",
        categoria: "facturación",
        descripcion: `Factura generada desde recibo #${reciboId}`,
        monto: total,
        origen: "factura",
        referenciaId: nuevaFactura.id,
      },
    });

    // Devolver la factura completa
    return tx.factura.findUnique({
      where: { id: nuevaFactura.id },
      include: { items: true, cliente: true },
    });
  });

  // Enviar factura por correo electrónico al cliente
  if (factura && factura.cliente && factura.cliente.email) {
    try {
      const facturaPDF = await generarFacturaPDF(factura.id);

      await sendEmail({
        to: factura.cliente.email,
        subject: `Factura N° ${factura.numeroAnual} - Tintado Valencia`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Factura Generada</h2>
            <p>Estimado/a ${factura.cliente.nombre || "Cliente"},</p>
            <p>Se ha generado su factura N° <strong>${factura.numeroAnual}</strong> por un importe de <strong>€${factura.total.toFixed(2)}</strong>.</p>
            <p>Puede encontrar la factura adjunta en formato PDF.</p>
            <p>Gracias por confiar en nuestros servicios.</p>
            <br>
            <p>Atentamente,<br>Equipo de Tintado Valencia</p>
          </div>
        `,
        attachments: [
          {
            filename: `Factura_${factura.numeroAnual}.pdf`,
            content: facturaPDF,
          },
        ],
      });
    } catch (error) {
      console.error(
        "[convertirReciboAFacturaService] Error al enviar factura por email:",
        error
      );
      // No lanzamos el error para no afectar la conversión del recibo
    }
  }

  return factura;
}
