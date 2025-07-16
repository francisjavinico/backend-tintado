import {
  createTransaccion,
  deleteTransaccion,
  getResumenGrafico,
  getTransaccionById,
  getTransacciones,
  putTransaccion,
} from "@src/controllers/TransaccionController";
import { authRole } from "@src/middlewares/authRole";
import { authToken } from "@src/middlewares/authToken";
import { Router } from "express";

const router = Router();
router.get("/resumen-grafico", authToken, getResumenGrafico);

router.get("/", authToken, getTransacciones);

router.get("/:id", authToken, getTransaccionById);

router.post("/", authToken, createTransaccion);

router.put("/:id", authToken, authRole("admin"), putTransaccion);

router.delete("/:id", authToken, authRole("admin"), deleteTransaccion);

export default router;
