import { Prisma, PrismaClient } from "@prisma/client";
import { ConflictError } from "@src/errors/ConflictError";
import { NotFoundError } from "@src/errors/NotFoundError";
import { ValidationError } from "@src/errors/ValidationError";
import { vehicleSchema } from "@src/schemas/vehicleSchema";

const prisma = new PrismaClient();
type VehicleCreateInput = Prisma.VehiculoCreateInput;

// Service para crear nueva vehiculo
export async function createVehicleService(vehicle: VehicleCreateInput) {
  // Ignorar el campo id si viene en el body
  const { id, ...vehicleData } = vehicle as any;
  // Convertir marca y modelo a mayúsculas antes de guardar
  if (vehicleData.marca) vehicleData.marca = vehicleData.marca.toUpperCase();
  if (vehicleData.modelo) vehicleData.modelo = vehicleData.modelo.toUpperCase();
  console.log("[createVehicleService] Datos recibidos:", vehicleData);
  const vehicleParsedData = vehicleSchema.safeParse(vehicleData);
  if (!vehicleParsedData.success) {
    throw new ValidationError(vehicleParsedData.error.message);
  }
  const { marca, modelo, año, numeroPuertas } = vehicleParsedData.data;
  console.log("[createVehicleService] Buscando duplicado con:", {
    marca,
    modelo,
    año,
    numeroPuertas,
  });
  const vehicleExist = await prisma.vehiculo.findFirst({
    where: { marca, modelo, año, numeroPuertas },
  });
  console.log(
    "[createVehicleService] Resultado búsqueda duplicado:",
    vehicleExist
  );
  if (vehicleExist) {
    throw new ConflictError("El vehiculo ya existe en la Base de Datos");
  }
  const newVehicle = await prisma.vehiculo.create({
    data: {
      marca,
      modelo,
      año,
      numeroPuertas,
    },
  });
  return newVehicle;
}

// Service para obtener un vehiculo por sus caracteristicas
export async function getVehicleService(
  marca: string,
  modelo: string,
  año: number,
  numeroPuertas: number
) {
  const vehicle = await prisma.vehiculo.findUnique({
    where: {
      marca_modelo_año_numeroPuertas: {
        marca,
        modelo,
        año,
        numeroPuertas,
      },
    },
  });
  if (!vehicle) {
    throw new NotFoundError("Vehiculo no encontrado");
  }
  return vehicle;
}

// Service para obtener todos los vehiculos con búsqueda y paginación
export async function getVehiclesService({
  marca,
  modelo,
  año,
  page = 1,
  pageSize = 20,
  search,
}: {
  marca?: string;
  modelo?: string;
  año?: number;
  page?: number;
  pageSize?: number;
  search?: string;
} = {}) {
  const where: Prisma.VehiculoWhereInput = {};
  if (marca) {
    where.marca = { contains: marca };
  }
  if (modelo) {
    where.modelo = { contains: modelo };
  }
  if (typeof año === "number") {
    where.año = año;
  }
  if (search) {
    const palabras = search.toUpperCase().split(/\s+/).filter(Boolean);
    const orFilters = [];
    for (const palabra of palabras) {
      orFilters.push({ marca: { contains: palabra } });
      orFilters.push({ modelo: { contains: palabra } });
      if (!isNaN(Number(palabra))) {
        orFilters.push({ año: Number(palabra) });
      }
    }
    where.OR = orFilters;
  }
  // Normaliza page y pageSize por si llegan valores inválidos
  const safePage = typeof page === "number" && page > 0 ? page : 1;
  const safePageSize =
    typeof pageSize === "number" && pageSize > 0 ? pageSize : 20;
  const skip = (safePage - 1) * safePageSize;
  const [vehicles, total] = await Promise.all([
    prisma.vehiculo.findMany({
      where,
      orderBy: [{ marca: "asc" }, { modelo: "asc" }, { año: "desc" }],
      skip,
      take: safePageSize,
    }),
    prisma.vehiculo.count({ where }),
  ]);
  // Si hay búsqueda, filtrar en JS por la frase completa
  let filteredVehicles = vehicles;
  if (search) {
    const frase = search.toUpperCase().trim().replace(/\s+/g, " ");
    // 1. Buscar coincidencia exacta de la frase completa
    filteredVehicles = vehicles.filter((v) => {
      const texto = `${v.marca} ${v.modelo} ${v.año}`
        .toUpperCase()
        .replace(/\s+/g, " ");
      return texto.includes(frase);
    });
    // 2. Si no hay resultados, buscar por palabras (todas deben estar presentes)
    if (filteredVehicles.length === 0) {
      const palabras = frase.split(" ");
      filteredVehicles = vehicles.filter((v) => {
        const texto = `${v.marca} ${v.modelo} ${v.año}`
          .toUpperCase()
          .replace(/\s+/g, " ");
        return palabras.every((palabra) => texto.includes(palabra));
      });
    }
  }
  return {
    vehicles: filteredVehicles,
    total: filteredVehicles.length,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(filteredVehicles.length / safePageSize),
  };
}

//Service para modificar un vehiculo

export async function updateVehicleService(
  id: number,
  vehicle: VehicleCreateInput
) {
  const parsedData = vehicleSchema.safeParse(vehicle);
  if (!parsedData.success) {
    const errors = parsedData.error.message;
    throw new ValidationError(errors);
  }
  const { marca, modelo, año, numeroPuertas } = parsedData.data;
  const updatedVehicle = await prisma.vehiculo.update({
    where: { id },
    data: {
      marca,
      modelo,
      año,
      numeroPuertas,
    },
  });
  if (!updatedVehicle) {
    throw new NotFoundError("Vehiculo no encontrado");
  }
  return updatedVehicle;
}

//Servicio para eliminar una cita por la ID
export async function deleteVehicleService(id: number) {
  const deletedVehicle = await prisma.vehiculo.delete({
    where: { id: Number(id) },
  });
  if (!deletedVehicle) {
    throw new NotFoundError("Vehiculo no encontrado");
  }
  return deletedVehicle;
}

// Servicio para obtener estadisticas de los vehiculos

export async function getVehiculosEstadisticasService() {
  const citasCompletadas = await prisma.cita.findMany({
    where: { estado: "completada" },
    select: {
      vehiculoId: true,
      presupuestoMax: true,
      presupuestoBasico: true, // <-- Añadido
      presupuestoIntermedio: true, // <-- Añadido
    },
  });

  const agrupadas: Record<
    number,
    {
      total: number;
      sumaMax: number;
      sumaBasico: number;
      sumaIntermedio: number;
      countBasico: number;
      countIntermedio: number;
    }
  > = {};

  for (const cita of citasCompletadas) {
    const vId = cita.vehiculoId;
    if (!agrupadas[vId]) {
      agrupadas[vId] = {
        total: 0,
        sumaMax: 0,
        sumaBasico: 0,
        sumaIntermedio: 0,
        countBasico: 0,
        countIntermedio: 0,
      };
    }
    agrupadas[vId].total += 1;
    if (typeof cita.presupuestoMax === "number") {
      agrupadas[vId].sumaMax += cita.presupuestoMax;
    }
    if (typeof cita.presupuestoBasico === "number") {
      agrupadas[vId].sumaBasico += cita.presupuestoBasico;
      agrupadas[vId].countBasico += 1;
    }
    if (typeof cita.presupuestoIntermedio === "number") {
      agrupadas[vId].sumaIntermedio += cita.presupuestoIntermedio;
      agrupadas[vId].countIntermedio += 1;
    }
  }

  const vehiculos = await prisma.vehiculo.findMany({
    where: {
      id: { in: Object.keys(agrupadas).map((id) => parseInt(id)) },
    },
  });

  const estadisticas = vehiculos.map((vehiculo) => {
    const datos = agrupadas[vehiculo.id];
    return {
      vehiculoId: vehiculo.id,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      año: vehiculo.año,
      atenciones: datos.total,
      promedioMax: Math.round(datos.sumaMax / datos.total),
      promedioBasico:
        datos.countBasico > 0
          ? Math.round(datos.sumaBasico / datos.countBasico)
          : null,
      promedioIntermedio:
        datos.countIntermedio > 0
          ? Math.round(datos.sumaIntermedio / datos.countIntermedio)
          : null,
    };
  });

  return estadisticas;
}
