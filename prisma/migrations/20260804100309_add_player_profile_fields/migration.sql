-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "experienceYears" INTEGER,
ADD COLUMN     "hometown" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "weightKg" INTEGER;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "primaryColor" TEXT;
