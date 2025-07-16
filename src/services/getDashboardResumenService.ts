import {
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  subMonths,
} from "date-fns";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Función auxiliar para calcular el porcentaje de cambio
function calcularPorcentajeCambio(actual: number, anterior: number): number {
  if (anterior === 0) return actual > 0 ? 100 : 0;
  return ((actual - anterior) / anterior) * 100;
}

export async function getDashboardResumenService() {
  const hoy = new Date();
  const mesActual = startOfMonth(hoy);
  const mesAnterior = startOfMonth(subMonths(hoy, 1));

  // Datos del mes actual
  const ingresosMesActual = await prisma.transaccion.aggregate({
    _sum: { monto: true },
    where: {
      tipo: "ingreso",
      fecha: {
        gte: mesActual,
        lte: endOfMonth(hoy),
      },
    },
  });

  const gastosMesActual = await prisma.transaccion.aggregate({
    _sum: { monto: true },
    where: {
      tipo: "gasto",
      fecha: {
        gte: mesActual,
        lte: endOfMonth(hoy),
      },
    },
  });

  // Datos del mes anterior
  const ingresosMesAnterior = await prisma.transaccion.aggregate({
    _sum: { monto: true },
    where: {
      tipo: "ingreso",
      fecha: {
        gte: mesAnterior,
        lte: endOfMonth(subMonths(hoy, 1)),
      },
    },
  });

  const gastosMesAnterior = await prisma.transaccion.aggregate({
    _sum: { monto: true },
    where: {
      tipo: "gasto",
      fecha: {
        gte: mesAnterior,
        lte: endOfMonth(subMonths(hoy, 1)),
      },
    },
  });

  // Citas pendientes
  const citasPendientes = await prisma.cita.count({
    where: {
      estado: "pendiente",
    },
  });

  // Clientes nuevos del mes actual
  const clientesNuevosMesActual = await prisma.cliente.count({
    where: {
      createdAt: {
        gte: mesActual,
        lte: endOfMonth(hoy),
      },
    },
  });

  // Clientes nuevos del mes anterior
  const clientesNuevosMesAnterior = await prisma.cliente.count({
    where: {
      createdAt: {
        gte: mesAnterior,
        lte: endOfMonth(subMonths(hoy, 1)),
      },
    },
  });

  const facturadoMes = ingresosMesActual._sum.monto || 0;
  const gastosMes = gastosMesActual._sum.monto || 0;
  const facturadoMesAnterior = ingresosMesAnterior._sum.monto || 0;
  const gastosMesAnteriorValor = gastosMesAnterior._sum.monto || 0;

  return {
    facturadoMes,
    gastosMes,
    citasPendientes,
    clientesNuevos: clientesNuevosMesActual,
    tendencias: {
      facturado: {
        porcentaje: calcularPorcentajeCambio(
          facturadoMes,
          facturadoMesAnterior
        ),
        direccion: facturadoMes >= facturadoMesAnterior ? "up" : "down",
      },
      gastos: {
        porcentaje: calcularPorcentajeCambio(gastosMes, gastosMesAnteriorValor),
        direccion: gastosMes >= gastosMesAnteriorValor ? "up" : "down",
      },
      clientes: {
        porcentaje: calcularPorcentajeCambio(
          clientesNuevosMesActual,
          clientesNuevosMesAnterior
        ),
        direccion:
          clientesNuevosMesActual >= clientesNuevosMesAnterior ? "up" : "down",
      },
    },
  };
}

export async function getIngresosMensualesService() {
  const hoy = new Date();
  const transacciones = await prisma.transaccion.findMany({
    where: {
      tipo: "ingreso",
      fecha: {
        gte: startOfMonth(hoy),
        lte: endOfMonth(hoy),
      },
    },
    select: {
      fecha: true,
      monto: true,
    },
  });

  const ingresosPorDia: Record<string, number> = {};
  for (const t of transacciones) {
    const fecha = t.fecha.toISOString().split("T")[0];
    ingresosPorDia[fecha] = (ingresosPorDia[fecha] || 0) + t.monto;
  }

  const diasDelMes = eachDayOfInterval({
    start: startOfMonth(hoy),
    end: endOfMonth(hoy),
  });

  const resultado = diasDelMes.map((fecha) => {
    const key = fecha.toISOString().split("T")[0];
    return {
      periodo: key,
      ingresos: ingresosPorDia[key] || 0,
    };
  });
  return resultado;
}
