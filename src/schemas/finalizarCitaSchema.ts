import { z } from "zod";

export const itemSchema = z.object({
  descripcion: z.string().min(1, "La descripción es obligatoria"),
  cantidad: z.number().int().positive({ message: "Debe ser mayor a 0" }),
  precioUnit: z.number().nonnegative({ message: "Debe ser mayor o igual a 0" }),
});

export const servicioSchema = z.object({
  nombre: z.string().min(1, "El nombre del servicio es obligatorio"),
  descripcion: z.string().optional(),
  precio: z.number().nonnegative().optional(),
});

export const finalizarCitaSchema = z.object({
  citaId: z.number().int().positive(),
  clienteId: z.number().int().positive(),
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
  generarFactura: z.boolean(),
  matricula: z.string().optional(),
  tipoLamina: z.string().optional(),
});

export type FinalizarCitaInput = z.infer<typeof finalizarCitaSchema>;
