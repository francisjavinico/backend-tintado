import { z } from "zod";

export const baseTransaccionSchema = z.object({
  tipo: z.enum(["ingreso", "gasto"]),
  categoria: z.string().min(1),
  descripcion: z.string().min(1),
  monto: z.number().positive(),
  fecha: z.coerce.date(),
  origen: z.enum(["factura", "recibo", "manual"]),
  referenciaId: z.number().int().optional(),
  numeroFacturaGasto: z
    .string()
    .max(30, "Máximo 30 caracteres")
    .regex(/^[A-Za-z0-9-]*$/, "Solo letras, números y guiones")
    .optional()
    .or(z.literal(undefined)),
});

export const transaccionSchema = baseTransaccionSchema.refine(
  (data) => {
    if (data.tipo === "gasto") return true;
    return !data.numeroFacturaGasto;
  },
  {
    message: "numeroFacturaGasto solo permitido para tipo 'gasto'",
    path: ["numeroFacturaGasto"],
  }
);

export const updateTransaccionSchema = baseTransaccionSchema.partial().refine(
  (data) => {
    if (data.tipo === undefined || data.tipo === "gasto") return true;
    return !data.numeroFacturaGasto;
  },
  {
    message: "numeroFacturaGasto solo permitido para tipo 'gasto'",
    path: ["numeroFacturaGasto"],
  }
);

export const getTransaccionesQuerySchema = z.object({
  minMonto: z.coerce.number().positive().optional(),
  maxMonto: z.coerce.number().positive().optional(),
  dateFrom: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  dateTo: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  tipo: z.enum(["ingreso", "gasto"]).optional(),
  origen: z.enum(["factura", "recibo", "manual"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).optional(),
});

export const getTransaccionesResumenSchema = z.object({
  tipo: z.enum(["diario", "semanal", "mensual"]),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
