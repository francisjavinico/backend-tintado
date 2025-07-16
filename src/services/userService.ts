import { Prisma, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { ConflictError } from "@src/errors/ConflictError";
import { ValidationError } from "@src/errors/ValidationError";
import { updateUserSchema, userSchema } from "@src/schemas/userSchema";
import { NotFoundError } from "@src/errors/NotFoundError";

const prisma = new PrismaClient();
type UserCreateInput = Prisma.UserCreateInput;
type UserUpdateInput = Prisma.UserUpdateInput;

// Servicio Crear Usuario
export async function createUserService(user: UserCreateInput) {
  const parsedData = userSchema.safeParse(user);
  if (!parsedData.success) {
    const errors = parsedData.error.message;
    throw new ValidationError(errors);
  }
  const { name, email, password, role } = parsedData.data;

  const emailExist = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (emailExist) {
    throw new ConflictError("El usuario ya existe");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return newUser;
}

// Servicio Obtener todos los usuarios
export async function getUsersServices() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
  return users;
}

// Servicio Obtener Usuario por su ID
export async function getUserIdService(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) {
    throw new NotFoundError("Usuario no encontrado");
    return;
  }
  return user;
}

//Servicio Para Modificar un Usuario por su Id
export async function updateUserService(id: number, user: UserUpdateInput) {
  const parsedData = updateUserSchema.safeParse(user);
  if (!parsedData.success) {
    const errors = parsedData.error.message;
    throw new ValidationError(errors);
  }

  const { name, email, password, role } = parsedData.data;

  if (email) {
    const emailExist = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (emailExist && emailExist.id !== id) {
      throw new ConflictError("El usuario ya existe");
    }
  }

  const dataToUpdate: any = {};
  if (name) dataToUpdate.name = name;
  if (email) dataToUpdate.email = email;
  if (role) dataToUpdate.role = role;
  if (password) dataToUpdate.password = await bcrypt.hash(password, 10);

  const updatedUser = await prisma.user.update({
    where: { id },
    data: dataToUpdate,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return updatedUser;
}

//Servicio Para Eliminar Usuario por Id
export async function deleteUserService(id: number) {
  return await prisma.user.delete({
    where: { id: Number(id) },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}
