-- DropForeignKey
ALTER TABLE "support_messages" DROP CONSTRAINT "support_messages_senderId_fkey";

-- AlterTable
ALTER TABLE "support_messages" ALTER COLUMN "senderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
