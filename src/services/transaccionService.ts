import { Prisma, PrismaClient } from "@prisma/client";
import { ConflictError } from "@src/errors/ConflictError";
import { NotFoundError } from "@src/errors/NotFoundError";
import { ValidationError } from "@src/errors/ValidationError";
import {
  transaccionSchema,
  updateTransaccionSchema,
} from "@src/schemas/transaccionSchema";

const prisma = new PrismaClient();
type TransaccionWhereInput = Prisma.TransaccionWhereInput;
type TransaccionCreateInput = Prisma.TransaccionCreateInput;
type TransaccionUpdateInput = Prisma.TransaccionUpdateInput;

export interface TransaccionFilter {
  tipo?: "ingreso" | "gasto";
  origen?: "factura" | "recibo" | "manual";
  dateFrom?: Date;
  dateTo?: Date;
  minMonto?: number;
  maxMonto?: number;
  page?: number;
  pageSize?: number;
}

//Servicio para crear una transaccion
export async function createTransaccionService(data: TransaccionCreateInput) {
  const parsedData = transaccionSchema.safeParse(data);
  if (!parsedData.success) {
    throw new ValidationError(parsedData.error.message);
  }
  const {
    tipo,
    categoria,
    descripcion,
    monto,
    fecha,
    origen,
    referenciaId,
    numeroFacturaGasto,
  } = parsedData.data;

  if (
    (origen === "factura" || origen === "recibo") &&
    referenciaId === undefined
  ) {
    throw new ValidationError(
      `Debe proporcionar referenciaId para origen '${origen}'`
    );
  }

  if (origen === "factura") {
    const result = await prisma.factura.findUnique({
      where: { id: referenciaId },
    });
    if (!result) throw new NotFoundError("Factura referenciada no existe");
  }

  if (origen === "recibo") {
    const result = await prisma.recibo.findUnique({
      where: { id: referenciaId },
    });
    if (!result) throw new NotFoundError("Recibo referenciado no existe");
  }

  try {
    const tx = await prisma.transaccion.create({
      data: {
        tipo,
        categoria,
        descripcion,
        monto,
        fecha,
        origen,
        referenciaId,
        numeroFacturaGasto: tipo === "gasto" ? numeroFacturaGasto : undefined,
      },
    });
    return tx;
  } catch (err: any) {
    if (err.code === "P2002" && err.meta?.target?.includes("referenciaId")) {
      throw new ConflictError(
        "Ya existe una transacción para esa factura o recibo"
      );
    }
    throw err;
  }
}

// Servicio para obtener facturas de acuerdo al filtro
export async function getTransaccionService(filter: TransaccionFilter) {
  const where: TransaccionWhereInput = {};
  if (filter.tipo) where.tipo = filter.tipo;
  if (filter.origen) where.origen = filter.origen;
  if (filter.dateFrom || filter.dateTo) {
    where.fecha = {
      ...(filter.dateFrom && { gte: new Date(filter.dateFrom) }),
      ...(filter.dateTo && {
        lt: new Date(new Date(filter.dateTo).getTime() + 24 * 60 * 60 * 1000),
      }),
    };
  }
  if (filter.minMonto || filter.maxMonto) {
    where.monto = {
      ...(filter.minMonto && { gte: filter.minMonto }),
      ...(filter.maxMonto && { lte: filter.maxMonto }),
    };
  }

  const hayFiltros = !!(
    filter.tipo ||
    filter.origen ||
    filter.dateFrom ||
    filter.dateTo ||
    filter.minMonto ||
    filter.maxMonto
  );

  if (!hayFiltros) {
    // Solo las 10 últimas, sin total, de cualquier tipo
    const transacciones = await prisma.transaccion.findMany({
      orderBy: { fecha: "desc" },
      take: 10,
    });
    return { transacciones };
  } else {
    // Con filtros: paginación y total
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 10;
    const [transacciones, total] = await Promise.all([
      prisma.transaccion.findMany({
        where,
        orderBy: { fecha: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaccion.count({ where }),
    ]);
    return { transacciones, total };
  }
}

// Servicio para obtener transaccion por ID
export async function getTransaccionIdService(id: number) {
  const transaccion = await prisma.transaccion.findUnique({
    where: { id },
  });
  if (!transaccion) {
    throw new NotFoundError("Transaccion no encontrada");
  }
  return transaccion;
}

// Servicio para actualizar transaccion
export async function updateTransaccionService(
  id: number,
  data: TransaccionUpdateInput
) {
  const parsed = updateTransaccionSchema.safeParse(data);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message);
  }

  const {
    tipo,
    categoria,
    descripcion,
    monto,
    fecha,
    origen,
    referenciaId,
    numeroFacturaGasto,
  } = parsed.data;

  const transaccion = await prisma.transaccion.findUnique({
    where: { id },
  });

  if (!transaccion) {
    throw new NotFoundError("La transaccion no existe en la base de datos");
  }

  if (
    (origen === "factura" || origen === "recibo") &&
    referenciaId === undefined
  ) {
    throw new ValidationError(
      `Debe proporcionar referenciaId para origen '${origen}'`
    );
  }

  if (origen === "factura") {
    const result = await prisma.factura.findUnique({
      where: { id: referenciaId },
    });
    if (!result) throw new NotFoundError("Factura referenciada no existe");
  }

  if (origen === "recibo") {
    const result = await prisma.recibo.findUnique({
      where: { id: referenciaId },
    });
    if (!result) throw new NotFoundError("Recibo referenciado no existe");
  }

  const updateData: Prisma.TransaccionUpdateInput = {
    ...(tipo !== undefined && { tipo }),
    ...(categoria !== undefined && { categoria }),
    ...(descripcion !== undefined && { descripcion }),
    ...(monto !== undefined && { monto }),
    ...(fecha !== undefined && { fecha }),
    ...(origen !== undefined && { origen }),
    ...(referenciaId !== undefined && { referenciaId }),
    ...(tipo === "gasto" && { numeroFacturaGasto }),
    ...(tipo !== "gasto" && { numeroFacturaGasto: undefined }),
  };

  try {
    return await prisma.transaccion.update({
      where: { id },
      data: updateData,
    });
  } catch (err: any) {
    if (
      err.code === "P2002" &&
      Array.isArray(err.meta?.target) &&
      err.meta.target.includes("referenciaId")
    ) {
      throw new ConflictError(
        "Ya existe una transacción para esa factura o recibo"
      );
    }
    throw err;
  }
}

// Servicio para borrar transaccion
export async function deleteTransaccionService(id: number) {
  const transaccion = await prisma.transaccion.findUnique({
    where: { id },
  });
  if (!transaccion) {
    throw new NotFoundError(
      "No se encuentra la transaccion en la base de datos"
    );
  }
  const deleted = await prisma.transaccion.delete({
    where: { id },
  });

  return deleted;
}

export async function createTransaccionAutoService(
  origen: "recibo" | "factura",
  referenciaId: number,
  monto: number,
  descripcion?: string
) {
  const fecha = new Date();
  const data = {
    tipo: "ingreso",
    categoria: "servicio",
    descripcion: descripcion ?? `Ingreso automático por ${origen}`,
    monto,
    fecha,
    origen,
    referenciaId,
  } as Prisma.TransaccionUncheckedCreateInput;
  return await createTransaccionService(data);
}

export async function getTransaccionesResumenService(
  agrupacion: "dia" | "semana" | "mes",
  dateFrom?: Date,
  dateTo?: Date
) {
  const groupBy = {
    dia: "DATE_FORMAT(fecha, '%Y-%m-%d')",
    semana: "CONCAT(YEAR(fecha), '-', LPAD(WEEK(fecha, 1), 2, '0'))",
    mes: "DATE_FORMAT(fecha, '%Y-%m')",
  }[agrupacion];

  const filtros: string[] = [];
  if (dateFrom)
    filtros.push(`fecha >= '${dateFrom.toISOString().slice(0, 10)}'`);
  if (dateTo)
    filtros.push(
      `fecha < '${new Date(dateTo.getTime() + 86400000).toISOString().slice(0, 10)}'`
    );

  const whereClause = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

  const resultados = await prisma.$queryRawUnsafe<
    {
      periodo: string;
      ingresos: number;
      gastos: number;
    }[]
  >(
    `SELECT
        ${groupBy} AS periodo,
        SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) AS ingresos,
        SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) AS gastos
     FROM Transaccion
     ${whereClause}
     GROUP BY periodo
     ORDER BY periodo ASC;`
  );

  return resultados;
}
