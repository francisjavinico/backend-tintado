import { PrismaClient, User } from "@prisma/client";
import { ConflictError } from "@src/errors/ConflictError";
import { NotFoundError } from "@src/errors/NotFoundError";
import { ValidationError } from "@src/errors/ValidationError";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "@src/schemas/authSchema";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { infer, z } from "zod";
import { sendEmail } from "@src/util/mailer";

const prisma = new PrismaClient();
type LoginInput = z.infer<typeof loginSchema>;

export async function loginService({ email, password }: LoginInput) {
  const parsedData = loginSchema.safeParse({ email, password });
  if (!parsedData.success) {
    const errors = parsedData.error.message;
    throw new ValidationError(errors);
  }
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new NotFoundError("El correo no existe en la base de datos");
  }
  const passwordValidation = await bcrypt.compare(password, user.password);
  if (!passwordValidation) {
    throw new ValidationError("Contraseña invalida");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn } as SignOptions
  );
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function forgotPasswordService(email: string) {
  const parsedEmail = forgotPasswordSchema.safeParse({ email });
  if (!parsedEmail.success) {
    throw new ValidationError(parsedEmail.error.message);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    return;
  }
  const token = crypto.randomUUID();
  const expiresAt = dayjs().add(30, "minutes").toDate();

  await prisma.passwordResetToken.create({
    data: { email, token, expiresAt },
  });

  // Enviar email con el enlace de recuperación
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
  const html = `
    <h2>Recuperación de contraseña</h2>
    <p>Hola, has solicitado restablecer tu contraseña.</p>
    <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
    <p><a href="${resetUrl}">Restablecer contraseña</a></p>
    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
    <p>El enlace expirará en 30 minutos.</p>
  `;
  try {
    await sendEmail({
      to: email,
      subject: "Recuperación de contraseña - Tintado Valencia",
      html,
    });
  } catch (err) {
    console.error("[forgotPasswordService] Error enviando email:", err);
  }

  return token;
}

export async function resetPasswordService(token: string, password: string) {
  const parsedData = resetPasswordSchema.safeParse({ token, password });
  if (!parsedData.success) {
    throw new ValidationError(parsedData.error.message);
  }
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });
  if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
    throw new ConflictError("Token invalido o expirado");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email: resetToken.email },
    data: { password: hashedPassword },
  });
  await prisma.passwordResetToken.update({
    where: { token },
    data: { used: true },
  });
}

export async function getProfileService(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) {
    throw new NotFoundError("Usuario no encontrado");
  }
  return user;
}

export async function hasUsersService(): Promise<boolean> {
  const count = await prisma.user.count();
  return count > 0;
}

export async function createFirstUserService({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    throw new ConflictError(
      "Ya existe al menos un usuario. No se puede crear otro usuario inicial."
    );
  }
  if (!name || !email || !password) {
    throw new ValidationError("Todos los campos son obligatorios");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "admin",
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return user;
}
