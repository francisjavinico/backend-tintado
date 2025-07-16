import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Debe tener una longitud mayor a 2 caracteres"),
  email: z.string().email("Formato de email invalido"),
  password: z.string().min(6, "La contraseña debe tener mas de 6 caracteres"),
  role: z.enum(["admin", "empleado"]),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Debe tener una longitud mayor a 2 caracteres")
    .optional(),
  email: z.string().email("Formato de email invalido").optional(),
  password: z
    .string()
    .min(6, "La contraseña debe tener mas de 6 caracteres")
    .optional(),
  role: z.enum(["admin", "empleado"]).optional(),
});
