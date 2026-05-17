/*
  Warnings:

  - You are about to drop the column `active` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `interval` on the `plans` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `plans` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `plans` DROP COLUMN `active`,
    DROP COLUMN `interval`,
    ADD COLUMN `billingCycle` ENUM('MONTHLY', 'YEARLY') NOT NULL DEFAULT 'MONTHLY',
    ADD COLUMN `currencyCode` VARCHAR(191) NOT NULL DEFAULT 'SAR',
    ADD COLUMN `currencySymbol` VARCHAR(191) NOT NULL DEFAULT 'ر.س',
    ADD COLUMN `discountType` ENUM('PERCENTAGE', 'FIXED', 'NONE') NOT NULL DEFAULT 'NONE',
    ADD COLUMN `discountValue` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `finalPrice` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isPopular` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `trialDays` INTEGER NOT NULL DEFAULT 0,
    MODIFY `price` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `subscriptions` ADD COLUMN `remainingDays` INTEGER NOT NULL DEFAULT 0,
    MODIFY `status` ENUM('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED', 'EXPIRED', 'CANCELLED', 'TRIAL') NOT NULL DEFAULT 'INACTIVE';
