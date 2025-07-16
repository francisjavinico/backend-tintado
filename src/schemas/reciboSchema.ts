import { z } from "zod";

// Schema para los ítems de un recibo
export const reciboItemSchema = z.object({
  descripcion: z.string().min(1, "La descripción es obligatoria"),
  cantidad: z.number().int().min(1, "La cantidad mínima es 1"),
  precioUnit: z.number().nonnegative("Precio unitario inválido"),
});

// Schema base del recibo (sin ítems aún)
export const baseReciboSchema = z.object({
  clienteId: z
    .number({ required_error: "clienteId es obligatorio" })
    .int("Debe ser un número entero positivo")
    .positive("clienteId debe ser mayor que 0"),
  citaId: z
    .number({ required_error: "citaId es obligatorio" })
    .int("Debe ser un número entero positivo")
    .positive("citaId debe ser mayor que 0"),
  descripcion: z.string().max(255).optional(),
  matricula: z.string().optional(),
});

// Schema para crear un recibo con ítems
export const createReciboSchema = baseReciboSchema.extend({
  items: z.array(reciboItemSchema).min(1, "Debe incluir al menos un ítem"),
});

// Schema para crear recibo automático desde cita
export const createReciboAutoSchema = z.object({
  citaId: z.number().int().positive("citaId debe ser mayor que 0"),
  items: z.array(reciboItemSchema).min(1, "Debe incluir al menos un ítem"),
});

// Schema para actualizar un recibo (todos los campos opcionales)
export const updateReciboSchema = createReciboSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });

// Schema para filtrar recibos por query params
export const getRecibosQuerySchema = z.object({
  clienteId: z.coerce.number().int().optional(),
  minTotal: z.coerce.number().nonnegative().optional(),
  maxTotal: z.coerce.number().nonnegative().optional(),
  dateFrom: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? new Date(val) : undefined)),

  dateTo: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? new Date(val) : undefined)),
  cliente: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).optional(),
});
