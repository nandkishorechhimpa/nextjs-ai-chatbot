ALTER TABLE "content" ALTER COLUMN "embedding" SET DATA TYPE vector(768);--> statement-breakpoint
-- ALTER TABLE "Document" ADD COLUMN "source" varchar;--> statement-breakpoint
-- ALTER TABLE "Document" ADD COLUMN "url" text;