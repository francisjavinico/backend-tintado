-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'empleado') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `passwordResetToken` VARCHAR(255) NULL,
    `passwordResetTokenExpires` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NULL,
    `apellido` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `documentoIdentidad` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NOT NULL,
    `consentimientoLOPD` BOOLEAN NOT NULL DEFAULT false,
    `aceptaPromociones` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Cliente_telefono_key`(`telefono`),
    UNIQUE INDEX `Cliente_documentoIdentidad_key`(`documentoIdentidad`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vehiculo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `marca` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `año` INTEGER NOT NULL,
    `numeroPuertas` INTEGER NOT NULL,

    UNIQUE INDEX `Vehiculo_marca_modelo_año_numeroPuertas_key`(`marca`, `modelo`, `año`, `numeroPuertas`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cita` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `estado` ENUM('pendiente', 'completada', 'cancelada') NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `presupuestoMin` DOUBLE NOT NULL,
    `presupuestoMax` DOUBLE NOT NULL,
    `presupuestoBasico` DOUBLE NULL,
    `presupuestoIntermedio` DOUBLE NULL,
    `presupuestoPremium` DOUBLE NULL,
    `matricula` VARCHAR(191) NULL,
    `clienteId` INTEGER NULL,
    `vehiculoId` INTEGER NOT NULL,
    `servicios` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Garantia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `citaId` INTEGER NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `fechaInicio` DATETIME(3) NOT NULL,
    `fechaFin` DATETIME(3) NOT NULL,
    `matricula` VARCHAR(191) NULL,

    UNIQUE INDEX `Garantia_citaId_key`(`citaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FacturaItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `facturaId` INTEGER NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precioUnit` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Factura` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `clienteId` INTEGER NOT NULL,
    `citaId` INTEGER NULL,
    `subtotal` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `iva` DOUBLE NOT NULL,
    `numeroAnual` INTEGER NOT NULL,
    `matricula` VARCHAR(191) NULL,
    `direccion_completa` VARCHAR(191) NULL,
    `nombre_cliente` VARCHAR(191) NULL,
    `dni_nie` VARCHAR(191) NULL,
    `servicios` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReciboItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reciboId` INTEGER NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `cantidad` INTEGER NOT NULL DEFAULT 1,
    `precioUnit` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Recibo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `citaId` INTEGER NOT NULL,
    `monto` DOUBLE NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `descripcion` VARCHAR(191) NULL,
    `numeroAnual` INTEGER NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'pendiente',
    `matricula` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaccion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('ingreso', 'gasto') NOT NULL,
    `categoria` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `monto` DOUBLE NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `origen` ENUM('factura', 'recibo', 'manual') NOT NULL,
    `referenciaId` INTEGER NULL,
    `numeroFacturaGasto` VARCHAR(30) NULL,

    UNIQUE INDEX `Transaccion_origen_referenciaId_key`(`origen`, `referenciaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `PasswordResetToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PresupuestoVehiculo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehiculoId` INTEGER NOT NULL,
    `citaId` INTEGER NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `presupuestoMin` DOUBLE NOT NULL,
    `presupuestoMax` DOUBLE NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PresupuestoVehiculo_citaId_key`(`citaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cita` ADD CONSTRAINT `Cita_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cita` ADD CONSTRAINT `Cita_vehiculoId_fkey` FOREIGN KEY (`vehiculoId`) REFERENCES `Vehiculo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Garantia` ADD CONSTRAINT `Garantia_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Garantia` ADD CONSTRAINT `Garantia_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `Cita`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacturaItem` ADD CONSTRAINT `FacturaItem_facturaId_fkey` FOREIGN KEY (`facturaId`) REFERENCES `Factura`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Factura` ADD CONSTRAINT `Factura_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Factura` ADD CONSTRAINT `Factura_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `Cita`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReciboItem` ADD CONSTRAINT `ReciboItem_reciboId_fkey` FOREIGN KEY (`reciboId`) REFERENCES `Recibo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recibo` ADD CONSTRAINT `Recibo_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recibo` ADD CONSTRAINT `Recibo_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `Cita`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PresupuestoVehiculo` ADD CONSTRAINT `PresupuestoVehiculo_vehiculoId_fkey` FOREIGN KEY (`vehiculoId`) REFERENCES `Vehiculo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PresupuestoVehiculo` ADD CONSTRAINT `PresupuestoVehiculo_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `Cita`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
