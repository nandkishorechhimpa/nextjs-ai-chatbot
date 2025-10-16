ALTER TABLE "content" ALTER COLUMN "embedding" SET DATA TYPE vector(384);--> statement-breakpoint
ALTER TABLE "content" ALTER COLUMN "embedding" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "content" ADD COLUMN "embedding_768" vector(768) NOT NULL;