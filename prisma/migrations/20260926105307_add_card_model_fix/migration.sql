-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_listId_fkey";

-- AlterTable
ALTER TABLE "Card" ALTER COLUMN "description" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;
