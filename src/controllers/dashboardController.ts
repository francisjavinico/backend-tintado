import {
  getDashboardResumenService,
  getIngresosMensualesService,
} from "@src/services/getDashboardResumenService";
import { Request, Response, NextFunction } from "express";

export const getDashboardResumen = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getDashboardResumenService();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

export const getGraficoIngresos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const datos = await getIngresosMensualesService();
    res.status(200).json(datos);
  } catch (error) {
    next(error);
  }
};
