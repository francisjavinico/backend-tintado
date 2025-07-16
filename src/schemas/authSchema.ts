import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("El email no tiene formato valido"),
  password: z
    .string()
    .min(6, "Debe contener al menos 6 caracteres")
    .max(14, "La longitud maxima es de 14 caracteres"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("El email no tiene formato valido"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(6, "Debe contener al menos 6 caracteres")
    .max(14, "La longitud maxima es de 14 caracteres"),
});
