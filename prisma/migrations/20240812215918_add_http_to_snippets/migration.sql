-- AlterTable
ALTER TABLE "snippets" ADD COLUMN     "http" JSONB,
ALTER COLUMN "json" DROP NOT NULL;
