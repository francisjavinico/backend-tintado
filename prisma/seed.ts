import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const plainPassword = "admin123";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await prisma.user.create({
    data: {
      name: "Admin Inicial",
      email: "admin@admin.com",
      password: hashedPassword,
      role: "admin",
    },
  });
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
