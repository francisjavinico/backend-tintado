import { Router } from "express";
import authRoute from "./authRoute";
import { citasRoute } from "./citasRoute";
import { clientRoute } from "./clientRoute";
import { facturaRoute } from "./facturasRoute";
import { garantiaRoute } from "./garantiaRoute";
import transaccionRoute from "./transaccionRoute";
import { usersRoute } from "./usersRoute";
import { vehicleRoute } from "./vehicleRoute";
import { presupuestoVehiculoRoute } from "./presupuestoVehiclesRoute";
import { recibosRoute } from "./recibosRoute";
import { dashboardRoute } from "./dashboardRoute";

const router = Router();

router.use("/auth", authRoute);
router.use("/users", usersRoute);
router.use("/citas", citasRoute);
router.use("/vehiculos", vehicleRoute);
router.use("/vehiculos/historial", presupuestoVehiculoRoute);
router.use("/clients", clientRoute);
router.use("/garantias", garantiaRoute);
router.use("/facturas", facturaRoute);
router.use("/transacciones", transaccionRoute);
router.use("/recibos", recibosRoute);
router.use("/dashboard", dashboardRoute);

export default router;
