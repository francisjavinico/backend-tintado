import { vehicleQuerySchema } from "@src/schemas/vehicleSchema";
import { getPresupuestosByVehiculoIdService } from "@src/services/citaService";
import {
  createVehicleService,
  deleteVehicleService,
  getVehicleService,
  getVehiclesService,
  getVehiculosEstadisticasService,
  updateVehicleService,
} from "@src/services/vehicleService";
import { Request, Response, NextFunction } from "express";

export const pushVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("[pushVehicle] Body recibido:", req.body);
  const result = await createVehicleService(req.body);
  res.status(200).json(result);
};

export const getVehicleId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const parsed = vehicleQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { marca, modelo, año, numeroPuertas } = parsed.data;
  const result = await getVehicleService(marca, modelo, año, numeroPuertas);
  res.status(200).json(result);
};

export const getVehicles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let { marca, modelo, año, page, pageSize, search } = req.query;
  // Normaliza y valida los parámetros de paginación
  const pageNum =
    page && !isNaN(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const pageSizeNum =
    pageSize && !isNaN(Number(pageSize)) && Number(pageSize) > 0
      ? Number(pageSize)
      : 20;
  const result = await getVehiclesService({
    marca: typeof marca === "string" ? marca : undefined,
    modelo: typeof modelo === "string" ? modelo : undefined,
    año: typeof año === "string" ? Number(año) : undefined,
    page: pageNum,
    pageSize: pageSizeNum,
    search: typeof search === "string" ? search : undefined,
  });
  res.status(200).json(result);
};

export const putVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const data = req.body;
  const updatedVehicle = await updateVehicleService(Number(id), data);
  res.status(200).json(updatedVehicle);
};

export const deleteVehicle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const deletedVehicle = await deleteVehicleService(Number(id));
  res.status(200).json(deletedVehicle);
};

export const getPresupuestosVehiculo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vehiculoId = Number(req.params.vehiculoId);
  if (isNaN(vehiculoId)) {
    res.status(400).json({ error: "El ID del vehículo debe ser un número." });
    return;
  }
  const result = await getPresupuestosByVehiculoIdService(vehiculoId);
  res.status(200).json(result);
};

export const getVehiculosEstadisticas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getVehiculosEstadisticasService();
    res.status(200).json(data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Error interno del servidor" });
  }
};
