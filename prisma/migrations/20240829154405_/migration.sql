/*
  Warnings:

  - You are about to drop the `appointment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `appointment` DROP FOREIGN KEY `Appointment_userId_fkey`;

-- DropTable
DROP TABLE `appointment`;
