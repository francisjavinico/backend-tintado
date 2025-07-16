import { z } from "zod";

const citasSchema = {
  fecha: z
    .string()
    .min(1, "La fecha es obligatoria.")
    .refine((val) => !isNaN(Date.parse(val)), "La fecha no es válida."),
  estado: z.enum(["pendiente", "completada", "cancelada"]),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  presupuestoMin: z.number().nonnegative().optional().nullable(),
  presupuestoMax: z.number().nonnegative().optional().nullable(),
  presupuestoBasico: z.number().nonnegative().optional(),
  presupuestoIntermedio: z.number().nonnegative().optional(),
  presupuestoPremium: z.number().nonnegative().optional(),
  matricula: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z
      .string()
      .min(7, "Matrícula inválida")
      .max(10, "Matrícula inválida")
      .optional()
  ),
  clienteId: z.number().optional(),
  vehiculoId: z.number({
    required_error: "El vehículo es obligatorio.",
    invalid_type_error: "Debes seleccionar un vehículo válido.",
  }),
};

const servicioSchema = z.object({
  nombre: z.string().min(1, "El nombre del servicio es obligatorio"),
  descripcion: z.string().optional(),
  precio: z.number().nonnegative().optional(),
});

export const createCitaSchema = z
  .object({
    ...citasSchema,
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
  })
  .superRefine((data, ctx) => {
    const tintado = data.servicios?.some(
      (s: any) => s.nombre === "Tintado de Lunas"
    );
    if (tintado) {
      if (typeof data.presupuestoBasico !== "number") {
        ctx.addIssue({
          path: ["presupuestoBasico"],
          code: z.ZodIssueCode.custom,
          message: "El presupuesto básico es obligatorio para Tintado de Lunas",
        });
      }
      if (typeof data.presupuestoIntermedio !== "number") {
        ctx.addIssue({
          path: ["presupuestoIntermedio"],
          code: z.ZodIssueCode.custom,
          message:
            "El presupuesto intermedio es obligatorio para Tintado de Lunas",
        });
      }
      if (typeof data.presupuestoPremium !== "number") {
        ctx.addIssue({
          path: ["presupuestoPremium"],
          code: z.ZodIssueCode.custom,
          message:
            "El presupuesto premium es obligatorio para Tintado de Lunas",
        });
      }
      if (typeof data.presupuestoMax === "number") {
        ctx.addIssue({
          path: ["presupuestoMax"],
          code: z.ZodIssueCode.custom,
          message: "No se debe enviar presupuestoMax para Tintado de Lunas",
        });
      }
    } else {
      if (typeof data.presupuestoMax !== "number") {
        ctx.addIssue({
          path: ["presupuestoMax"],
          code: z.ZodIssueCode.custom,
          message: "El presupuesto es obligatorio para este servicio",
        });
      }
    }
  });
export const updateCitaSchema = z
  .object({
    ...citasSchema,
    servicios: z.array(servicioSchema).optional(),
  })
  .partial()
  .superRefine((data, ctx) => {
    const tintado = data.servicios?.some(
      (s: any) => s.nombre === "Tintado de Lunas"
    );
    if (tintado) {
      if (typeof data.presupuestoBasico !== "number") {
        ctx.addIssue({
          path: ["presupuestoBasico"],
          code: z.ZodIssueCode.custom,
          message: "El presupuesto básico es obligatorio para Tintado de Lunas",
        });
      }
      if (typeof data.presupuestoIntermedio !== "number") {
        ctx.addIssue({
          path: ["presupuestoIntermedio"],
          code: z.ZodIssueCode.custom,
          message:
            "El presupuesto intermedio es obligatorio para Tintado de Lunas",
        });
      }
      if (typeof data.presupuestoPremium !== "number") {
        ctx.addIssue({
          path: ["presupuestoPremium"],
          code: z.ZodIssueCode.custom,
          message:
            "El presupuesto premium es obligatorio para Tintado de Lunas",
        });
      }
    }
  });
