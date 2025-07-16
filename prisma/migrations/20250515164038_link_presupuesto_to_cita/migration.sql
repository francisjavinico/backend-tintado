/*
  Warnings:

  - A unique constraint covering the columns `[citaId]` on the table `PresupuestoVehiculo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `citaId` to the `PresupuestoVehiculo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `presupuestovehiculo` ADD COLUMN `citaId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PresupuestoVehiculo_citaId_key` ON `PresupuestoVehiculo`(`citaId`);

-- AddForeignKey
ALTER TABLE `PresupuestoVehiculo` ADD CONSTRAINT `PresupuestoVehiculo_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `Cita`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
