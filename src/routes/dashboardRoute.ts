import { Router } from "express";
import {
  getDashboardResumen,
  getGraficoIngresos,
} from "@src/controllers/dashboardController";
import { authToken } from "@src/middlewares/authToken";

export const dashboardRoute = Router();

dashboardRoute.get("/resumen", authToken, getDashboardResumen);
dashboardRoute.get("/grafico-ingresos", authToken, getGraficoIngresos);
