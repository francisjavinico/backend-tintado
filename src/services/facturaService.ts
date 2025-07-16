import { Prisma, PrismaClient } from "@prisma/client";
import { NotFoundError } from "@src/errors/NotFoundError";
import { ValidationError } from "@src/errors/ValidationError";
import {
  createFacturaSchema,
  getFacturasQuerySchema,
  updateFacturaSchema,
} from "@src/schemas/facturaSchema";
import { createTransaccionAutoService } from "./transaccionService";

const prisma = new PrismaClient();
type FacturaWhereInput = Prisma.FacturaWhereInput;
type FacturaCreateInput = Prisma.FacturaCreateInput & { servicios?: any[] };
type FacturaUpdateInput = Prisma.FacturaUpdateInput;

export interface FacturasFilter {
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
  sumIva: number;
  sumSub: number;
}

export async function createFacturaService(data: any) {
  const parsedData = createFacturaSchema.safeParse(data);
  if (!parsedData.success) {
    console.error(
      "[createFacturaService] Error de validación:",
      parsedData.error
    );
    throw new ValidationError(parsedData.error.message);
  }
  const { clienteId, citaId, items, matricula, servicios } = parsedData.data;

  const idClienteExist = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: { id: true },
  });
  if (!idClienteExist) {
    console.error("[createFacturaService] Cliente no existe:", clienteId);
    throw new NotFoundError("El cliente no existe en la base de datos");
  }

  if (citaId) {
    const idCitaExist = await prisma.cita.findUnique({
      where: { id: citaId },
      select: { id: true },
    });
    if (!idCitaExist) {
      console.error("[createFacturaService] Cita no existe:", citaId);
      throw new NotFoundError(
        "La cita no se encuentra registrada en la base de datos"
      );
    }
  }

  // Si no se pasan items, generarlos a partir de servicios
  let facturaItems = items;
  if (
    (!facturaItems || facturaItems.length === 0) &&
    servicios &&
    servicios.length > 0
  ) {
    facturaItems = servicios.map((s: any) => ({
      descripcion: s.nombre === "Otros" ? s.descripcion : s.nombre,
      cantidad: 1,
      precioUnit: s.precio ?? 0,
    }));
  }

  const total = facturaItems.reduce(
    (sum: number, i: any) => sum + i.cantidad * i.precioUnit,
    0
  );
  const ivaRate = 0.21;
  const subtotal = +(total / (1 + ivaRate)).toFixed(2);
  const iva = +(total - subtotal).toFixed(2);

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

  const factura = await prisma.$transaction(async (tx) => {
    const factura = await tx.factura.create({
      data: {
        clienteId,
        citaId,
        subtotal,
        total,
        iva,
        numeroAnual,
        matricula,
        servicios: servicios ?? [],
      },
      select: { id: true },
    });

    const itemsData = facturaItems.map((it: any) => ({
      facturaId: factura.id,
      descripcion: it.descripcion,
      cantidad: it.cantidad,
      precioUnit: it.precioUnit,
    }));

    await tx.facturaItem.createMany({ data: itemsData });

    return tx.factura.findUnique({
      where: { id: factura.id },
      select: {
        id: true,
        clienteId: true,
        citaId: true,
        subtotal: true,
        total: true,
        iva: true,
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
        servicios: true,
      },
    });
  });

  if (!factura) {
    throw new Error(
      "Error inesperado: la factura no fue encontrada después de ser creada"
    );
  }

  await createTransaccionAutoService("factura", factura.id, factura.total);

  return factura;
}

export async function getFacturaService(filter: FacturasFilter) {
  const where: FacturaWhereInput = {};
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
    where.total = {
      ...(filter.minTotal && { gte: filter.minTotal }),
      ...(filter.maxTotal && { lte: filter.maxTotal }),
    };
  }

  const skip =
    filter.page && filter.pageSize
      ? (filter.page - 1) * filter.pageSize
      : undefined;
  const take = filter.pageSize;

  return prisma.factura.findMany({
    where,
    include: { items: true, cliente: true },
    orderBy: { fecha: "desc" },
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  });
}

export async function getFacturasIdService(id: number) {
  const factura = await prisma.factura.findUnique({
    where: { id },
    include: { items: true, cliente: true },
  });
  if (!factura) throw new NotFoundError("Factura no encontrada");
  return factura;
}

export async function updateFacturaService(id: number, data: any) {
  const parsed = updateFacturaSchema.safeParse(data);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message);
  }
  const { citaId, clienteId, items } = parsed.data;

  const factura = await prisma.factura.findUnique({
    where: { id },
    select: { id: true, subtotal: true, iva: true, total: true },
  });
  if (!factura)
    throw new NotFoundError("La factura no existe en la base de datos");

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

  let subtotal = factura.subtotal;
  let iva = factura.iva;
  let total = factura.total;
  if (items) {
    total = items.reduce(
      (sum: number, i: any) => sum + i.cantidad * i.precioUnit,
      0
    );
    const ivaRate = 0.21;
    subtotal = +(total / (1 + ivaRate)).toFixed(2);
    iva = +(total - subtotal).toFixed(2);
  }

  return prisma.$transaction(async (tx) => {
    await tx.factura.update({
      where: { id },
      data: {
        ...(clienteId !== undefined && { clienteId }),
        ...(citaId !== undefined && { citaId }),
        ...(items && { subtotal, iva, total }),
      },
    });

    if (items) {
      await tx.facturaItem.deleteMany({ where: { facturaId: id } });
      await tx.facturaItem.createMany({
        data: items.map((it: any) => ({
          facturaId: id,
          descripcion: it.descripcion,
          cantidad: it.cantidad,
          precioUnit: it.precioUnit,
        })),
      });
    }

    return tx.factura.findUnique({
      where: { id },
      select: {
        id: true,
        clienteId: true,
        citaId: true,
        subtotal: true,
        total: true,
        iva: true,
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

export async function deleteFacturaService(id: number) {
  const factura = await prisma.factura.findUnique({ where: { id } });
  if (!factura)
    throw new NotFoundError("No se encuentra la factura en la base de datos");

  return prisma.$transaction(async (tx) => {
    await tx.facturaItem.deleteMany({ where: { facturaId: id } });
    const deleted = await tx.factura.delete({ where: { id } });
    return deleted;
  });
}

export async function getBalanceService(
  filter: FacturasFilter
): Promise<BalanceResult> {
  const where: FacturaWhereInput = {};
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
    where.total = {
      ...(filter.minTotal && { gte: filter.minTotal }),
      ...(filter.maxTotal && { lte: filter.maxTotal }),
    };
  }
  const result = await prisma.factura.aggregate({
    where,
    _count: { _all: true },
    _sum: { total: true, iva: true, subtotal: true },
  });

  return {
    count: result._count._all,
    sumTotal: result._sum.total ?? 0,
    sumIva: result._sum.iva ?? 0,
    sumSub: result._sum.subtotal ?? 0,
  };
}
