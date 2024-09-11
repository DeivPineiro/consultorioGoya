-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "cancelcomment" TEXT,
ADD COLUMN     "cancelturn" BOOLEAN,
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "withnotice" BOOLEAN;
