-- CreateTable
CREATE TABLE `PresupuestoVehiculo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehiculoId` INTEGER NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `presupuestoMin` DOUBLE NOT NULL,
    `presupuestoMax` DOUBLE NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PresupuestoVehiculo` ADD CONSTRAINT `PresupuestoVehiculo_vehiculoId_fkey` FOREIGN KEY (`vehiculoId`) REFERENCES `Vehiculo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
