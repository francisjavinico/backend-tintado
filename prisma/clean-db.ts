import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Borra en orden de dependencias para evitar errores de claves foráneas
  await prisma.transaccion.deleteMany();
  await prisma.reciboItem.deleteMany();
  await prisma.recibo.deleteMany();
  await prisma.facturaItem.deleteMany();
  await prisma.factura.deleteMany();
  await prisma.garantia.deleteMany();
  await prisma.presupuestoVehiculo.deleteMany();
  await prisma.cita.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.vehiculo.deleteMany();
  // Borra todos los usuarios excepto el admin
  await prisma.user.deleteMany({
    where: { email: { not: "admin@admin.com" } },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
