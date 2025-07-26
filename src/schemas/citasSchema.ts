import { z } from "zod";

const citasSchema = {
  fecha: z
    .string()
    .min(1, "La fecha es obligatoria.")
    .refine((val) => !isNaN(Date.parse(val)), "La fecha no es válida."),
  estado: z.enum(["pendiente", "completada", "cancelada"]),
  telefono: z.preprocess(
    (val) => (typeof val === "string" ? val.replace(/\s+/g, "") : val),
    z
      .string()
      .min(1, "El teléfono es obligatorio")
      .regex(
        /^((\+34|0034)?[6-7][0-9]{8})$/,
        "El teléfono debe ser un número válido, con o sin prefijo (+34 o 0034)"
      )
  ),
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
      if (data.presupuestoMax !== undefined && data.presupuestoMax !== null) {
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
      if (
        typeof data.presupuestoBasico === "number" ||
        typeof data.presupuestoIntermedio === "number" ||
        typeof data.presupuestoPremium === "number"
      ) {
        ctx.addIssue({
          path: ["presupuestoBasico"],
          code: z.ZodIssueCode.custom,
          message: "Solo se debe enviar un presupuesto para este servicio",
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
      if (data.presupuestoMax !== undefined && data.presupuestoMax !== null) {
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
      if (
        typeof data.presupuestoBasico === "number" ||
        typeof data.presupuestoIntermedio === "number" ||
        typeof data.presupuestoPremium === "number"
      ) {
        ctx.addIssue({
          path: ["presupuestoBasico"],
          code: z.ZodIssueCode.custom,
          message: "Solo se debe enviar un presupuesto para este servicio",
        });
      }
    }
  });

// Esquema específico para cancelar citas que permite valores null
export const cancelCitaSchema = z.object({
  fecha: z.string().optional(),
  telefono: z.string().optional(),
  presupuestoMax: z.number().nonnegative().optional().nullable(),
  presupuestoBasico: z.number().nonnegative().optional().nullable(),
  presupuestoIntermedio: z.number().nonnegative().optional().nullable(),
  presupuestoPremium: z.number().nonnegative().optional().nullable(),
  matricula: z.string().optional().nullable(),
  clienteId: z.number().optional().nullable(),
  vehiculoId: z.number().optional(),
  estado: z.literal("cancelada"),
  descripcion: z.string().optional().nullable(),
  servicios: z.array(servicioSchema).optional(),
});
