import { z } from "zod";

export const facturaSchema = z.object({
  clienteId: z.number({ required_error: "clienteId es obligatorio" }),
  citaId: z.number().optional(),
  matricula: z.string().optional(),
});

export const facturaItemSchema = z.object({
  descripcion: z.string().min(1, "Descripción requerida"),
  cantidad: z.number().min(1, "Cantidad mínima 1"),
  precioUnit: z.number().min(0, "Precio unitario inválido"),
});

export const servicioSchema = z.object({
  nombre: z.string().min(1, "El nombre del servicio es obligatorio"),
  descripcion: z.string().optional(),
  precio: z.number().nonnegative().optional(),
});

export const createFacturaSchema = facturaSchema.extend({
  items: z.array(facturaItemSchema).min(1, "Debe tener al menos un item"),
  servicios: z
    .array(servicioSchema)
    .min(1, "Debe haber al menos un servicio")
    .refine(
      (servicios) =>
        servicios.every(
          (s) =>
            s.nombre !== "Otros" ||
            (s.descripcion && s.descripcion.trim() !== "")
        ),
      {
        message: "Si el servicio es 'Otros', la descripción es obligatoria",
      }
    ),
});

export const getFacturasQuerySchema = z.object({
  cliente: z.string().optional(),
  clienteId: z.coerce.number().optional(),
  minTotal: z.coerce.number().optional(),
  maxTotal: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).optional(),
  dateFrom: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? new Date(val) : undefined)),

  dateTo: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? new Date(val) : undefined)),
});

export const updateFacturaSchema = createFacturaSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });
