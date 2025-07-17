import { z } from "zod";

export const clientCreateSchema = z.object({
  nombre: z
    .string()
    .min(2, "Debe tener una longitud mayor a 2 caracteres")
    .max(25, "Debe tener una longitud menor o igual a 25 caracteres"),
  apellido: z
    .string()
    .min(2, "Debe tener una longitud mayor a 2 caracteres")
    .max(25, "Debe tener una longitud menor o igual a 25 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z
    .string()
    .min(2, "Debe tener una longitud mayor a 2 caracteres")
    .max(10, "Debe tener una longitud menor o igual a 10 caracteres"),
  documentoIdentidad: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z
      .string()
      .min(2, "Debe tener una longitud mayor a 2 caracteres")
      .max(10, "Debe tener una longitud menor o igual a 10 caracteres")
      .optional()
  ),
  direccion: z
    .string()
    .min(5, "La dirección es obligatoria y debe tener al menos 5 caracteres"),
  consentimientoLOPD: z.literal(true, {
    errorMap: () => ({
      message: "Debes aceptar la política de protección de datos",
    }),
  }),
  aceptaPromociones: z.boolean().optional(),
});

export const clientEditSchema = z.object({
  nombre: z
    .string()
    .min(2, "Debe tener una longitud mayor a 2 caracteres")
    .max(25, "Debe tener una longitud menor o igual a 25 caracteres"),
  apellido: z
    .string()
    .min(2, "Debe tener una longitud mayor a 2 caracteres")
    .max(25, "Debe tener una longitud menor o igual a 25 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z
    .string()
    .min(2, "Debe tener una longitud mayor a 2 caracteres")
    .max(10, "Debe tener una longitud menor o igual a 10 caracteres"),
  documentoIdentidad: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z
      .string()
      .min(2, "Debe tener una longitud mayor a 2 caracteres")
      .max(10, "Debe tener una longitud menor o igual a 10 caracteres")
      .optional()
  ),
  direccion: z
    .string()
    .min(5, "La dirección es obligatoria y debe tener al menos 5 caracteres"),
  consentimientoLOPD: z.boolean().optional(),
  aceptaPromociones: z.boolean().optional(),
});

// Para compatibilidad con código existente
export const clientSchema = clientCreateSchema;
