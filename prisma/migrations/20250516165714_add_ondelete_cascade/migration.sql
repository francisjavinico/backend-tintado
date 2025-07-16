-- DropForeignKey
ALTER TABLE `presupuestovehiculo` DROP FOREIGN KEY `PresupuestoVehiculo_citaId_fkey`;

-- AddForeignKey
ALTER TABLE `PresupuestoVehiculo` ADD CONSTRAINT `PresupuestoVehiculo_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `Cita`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
