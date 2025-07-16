import { z } from "zod";

export const garantiaSchema = z
  .object({
    descripcion: z.string().min(1, "Este campo es obligatorio").max(30),
    fechaInicio: z.coerce.date({ invalid_type_error: "fechaInicio inválida" }),
    fechaFin: z.coerce.date({ invalid_type_error: "fechaFin inválida" }),
  })
  .refine((d) => d.fechaFin > d.fechaInicio, {
    message: "fechaFin debe ser posterior a fechaInicio",
    path: ["fechaFin"],
  });
