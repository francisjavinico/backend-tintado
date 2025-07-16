import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Reiniciar contadores AUTO_INCREMENT para todas las tablas
  await prisma.$executeRaw`ALTER TABLE User AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE Cliente AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE Vehiculo AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE Cita AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE Garantia AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE FacturaItem AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE Factura AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE ReciboItem AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE Recibo AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE Transaccion AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE PasswordResetToken AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE PresupuestoVehiculo AUTO_INCREMENT = 1`;
}

main()
  .catch((e) => {
    console.error("Error al reiniciar contadores:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
