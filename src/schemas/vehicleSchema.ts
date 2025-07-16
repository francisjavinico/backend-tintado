import { z } from "zod";

export const vehicleSchema = z.object({
  marca: z.string().min(2, "Marca inválida"),
  modelo: z.string().min(1, "Modelo requerido"),
  año: z.number().min(1900).max(new Date().getFullYear()),
  numeroPuertas: z.number().min(2).max(6),
});

export const vehicleQuerySchema = z.object({
  marca: z.string().min(2, "Marca inválida"),
  modelo: z.string().min(1, "Modelo requerido"),
  año: z.coerce.number().min(1900).max(new Date().getFullYear()),
  numeroPuertas: z.coerce.number().min(2).max(6),
});
