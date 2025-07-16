const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const cita = await prisma.cita.create({
      data: {
        estado: "pendiente",
        fecha: new Date(),
        presupuestoMax: null,
        presupuestoMin: null,
        presupuestoBasico: 120,
        presupuestoIntermedio: 130,
        presupuestoPremium: 150,
        telefono: "123456789",
        servicios: [{ nombre: "Tintado de Lunas" }],
        clienteId: 1,
        vehiculo: { connect: { id: 2 } },
      },
    });
    console.log("Cita creada:", cita);
  } catch (e) {
    console.error("Error al crear cita:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
